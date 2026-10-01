# Auto Ticket Classification using Flow Designer

**Problem:** A school IT helpdesk receives many daily incidents (Wi-Fi issues, projector failures,
password problems, slow computers) and staff review each one manually before categorising and
assigning it.

**Solution:** A ServiceNow Flow Designer flow triggers when an Incident is created, classifies it
from keywords in the short description and description, sets category / subcategory / urgency /
impact / assignment group, and sends low-confidence tickets to the Service Desk for review.

## Contents
| Path | Purpose |
|---|---|
| `servicenow/flow_action_classify_ticket.js` | Script for the Flow Designer custom action |
| `servicenow/classification_rules.json` | Keyword rules, groups, urgency/impact (single source of truth) |
| `docs/flow_design.md` | Step-by-step flow build in Flow Designer |
| `docs/flow_diagram.mmd` | Mermaid diagram of the flow |
| `simulator/classifier.py` | Python mirror of the logic for local testing |
| `simulator/sample_tickets.csv` | Sample tickets with expected results |
| `simulator/run_demo.py`, `simulator/test_classifier.py` | Demo output and unit tests |

## Try the logic locally
```
cd simulator
python run_demo.py
python -m unittest -v
```

## Deploy in ServiceNow
Follow `docs/flow_design.md`. If you change a rule, update both the JSON file and the
`CONFIG` block in the JS script.
