"""Local Python mirror of the Flow Designer classification script.

Lets you test and tune the rules without a ServiceNow instance.
Reads ../servicenow/classification_rules.json (same rules as the JS script).
"""
import json
import os
import re

RULES_PATH = os.path.join(os.path.dirname(__file__), "..", "servicenow", "classification_rules.json")

# ServiceNow default priority lookup: PRIORITY[impact][urgency]
PRIORITY = {1: {1: 1, 2: 2, 3: 3}, 2: {1: 2, 2: 3, 3: 4}, 3: {1: 3, 2: 4, 3: 5}}


def load_rules(path=RULES_PATH):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _hits(text, keywords):
    count = 0
    for kw in keywords:
        if re.search(r"(^|[^a-z0-9])" + re.escape(kw) + r"([^a-z0-9]|$)", text):
            count += 1
    return count


def classify(short_description, description="", config=None):
    config = config or load_rules()
    sd, desc = (short_description or "").lower(), (description or "").lower()

    best, best_score, total = None, 0, 0
    for rule in config["rules"]:
        score = _hits(sd, rule["keywords"]) * 2 + _hits(desc, rule["keywords"])
        total += score
        if score > best_score:
            best, best_score = rule, score

    confidence = best_score / total if total else 0.0
    manual = best is None or confidence < 0.5

    d = config["default"]
    chosen = {"name": "No match", **d} if best is None else best
    group = d["assignment_group"] if manual else chosen["assignment_group"]

    urgency, impact = chosen["urgency"], chosen["impact"]
    if _hits(sd + " " + desc, config["escalation_keywords"]):
        urgency, impact = max(1, urgency - 1), max(1, impact - 1)

    return {
        "category": chosen["category"],
        "subcategory": chosen["subcategory"],
        "assignment_group": group,
        "urgency": urgency,
        "impact": impact,
        "priority": PRIORITY[impact][urgency],
        "matched_rule": chosen["name"],
        "confidence": round(confidence, 2),
        "needs_manual_review": manual,
    }
