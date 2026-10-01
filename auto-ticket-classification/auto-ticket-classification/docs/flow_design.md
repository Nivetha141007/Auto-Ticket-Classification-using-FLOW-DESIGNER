# Flow Designer build steps

**Flow name:** Auto Ticket Classification

## 1. Trigger
- Type: **Record > Created**
- Table: **Incident**
- Condition: `Category` is empty AND `Short description` is not empty
- Run: **For each unique change**

## 2. Custom Action: "Classify Ticket"
Create via *Flow Designer > Action designer > New*.
- Inputs: `short_description` (String), `description` (String)
- Add a **Script** step and paste `servicenow/flow_action_classify_ticket.js`
  (map script inputs `short_description` / `description` to the action inputs)
- Outputs: `category`, `subcategory`, `assignment_group`, `matched_rule`, `work_note` (String);
  `urgency`, `impact`, `priority` (Integer); `needs_manual_review` (True/False)

## 3. Look Up Record
- Table: **Group [sys_user_group]**
- Condition: `Name` is `Classify Ticket.assignment_group`

## 4. Update Incident (Update Record)
Record: trigger record. Fields:

| Field | Value |
|---|---|
| Category | Classify Ticket > category |
| Subcategory | Classify Ticket > subcategory |
| Urgency | Classify Ticket > urgency |
| Impact | Classify Ticket > impact |
| Assignment group | Look Up Record > Record |
| Work notes | Classify Ticket > work_note |

## 5. If / Else on `needs_manual_review`
- **True:** add a Send Email / Notification step to alert the Service Desk lead to review.
- **False:** end flow.

## 6. Pre-requisites in the instance
Create the groups **Service Desk, Network Support, Hardware Support, Software Support**
and add the subcategory choices used in the rules (Wi-Fi, Projector/AV, Performance,
Account/Password, Application) on the Incident table.

## 7. Testing
Use the **Test** button in Flow Designer with a sample Incident, or create real incidents
using the examples in `simulator/sample_tickets.csv`, then check the Flow Execution details.
