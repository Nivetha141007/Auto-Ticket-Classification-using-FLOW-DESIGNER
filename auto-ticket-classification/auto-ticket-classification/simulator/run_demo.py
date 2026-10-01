"""Classify every ticket in sample_tickets.csv and print a results table."""
import csv
import os
from classifier import classify

path = os.path.join(os.path.dirname(__file__), "sample_tickets.csv")
print(f"{'SHORT DESCRIPTION':38} {'CATEGORY':9} {'GROUP':17} U I P  CONF  REVIEW")
print("-" * 92)
with open(path, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        r = classify(row["short_description"], row["description"])
        print(f"{row['short_description'][:37]:38} {r['category']:9} {r['assignment_group']:17} "
              f"{r['urgency']} {r['impact']} {r['priority']}  {r['confidence']:<5} {r['needs_manual_review']}")
