/**
 * Flow Designer > Custom Action > Script step: "Classify Ticket"
 *
 * Action INPUTS  (String): short_description, description
 * Action OUTPUTS (String unless noted):
 *   category, subcategory, assignment_group,
 *   urgency (Integer), impact (Integer), priority (Integer, informational),
 *   matched_rule, needs_manual_review (True/False), work_note
 *
 * Keep the rules below in sync with classification_rules.json.
 * Category / subcategory / group names must match YOUR instance's values.
 */
(function execute(inputs, outputs) {

  var CONFIG = {
    defaults: { category: 'inquiry', subcategory: '', assignment_group: 'Service Desk', urgency: 3, impact: 3 },
    escalation: ['exam', 'urgent', 'all students', 'entire lab', 'whole class', 'everyone', 'principal', 'not working for all'],
    rules: [
      { name: 'Password / Account', category: 'software', subcategory: 'Account/Password', group: 'Service Desk', urgency: 2, impact: 3,
        keywords: ['password', 'forgot', 'locked out', 'account locked', 'login', 'log in', 'sign in', 'reset', 'credentials', 'otp'] },
      { name: 'Wi-Fi / Network', category: 'network', subcategory: 'Wi-Fi', group: 'Network Support', urgency: 2, impact: 2,
        keywords: ['wifi', 'wi-fi', 'internet', 'network', 'no connection', 'cannot connect', 'lan', 'router', 'signal', 'disconnecting'] },
      { name: 'Projector / Display', category: 'hardware', subcategory: 'Projector/AV', group: 'Hardware Support', urgency: 2, impact: 2,
        keywords: ['projector', 'hdmi', 'display', 'smart board', 'smartboard', 'screen', 'no signal', 'lamp', 'vga'] },
      { name: 'Slow Computer / Performance', category: 'hardware', subcategory: 'Performance', group: 'Hardware Support', urgency: 3, impact: 3,
        keywords: ['slow', 'lag', 'laggy', 'freeze', 'freezing', 'hang', 'hanging', 'performance', 'computer', 'laptop', 'pc', 'takes long', 'restart'] },
      { name: 'Software Install / Issue', category: 'software', subcategory: 'Application', group: 'Software Support', urgency: 3, impact: 3,
        keywords: ['install', 'software', 'application', 'app', 'license', 'update', 'crash', 'error'] }
    ]
  };

  // ServiceNow default priority lookup: PRIORITY[impact][urgency]
  var PRIORITY = { 1: { 1: 1, 2: 2, 3: 3 }, 2: { 1: 2, 2: 3, 3: 4 }, 3: { 1: 3, 2: 4, 3: 5 } };

  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function countHits(text, keywords) {
    var hits = 0;
    for (var i = 0; i < keywords.length; i++) {
      var re = new RegExp('(^|[^a-z0-9])' + escapeRegex(keywords[i]) + '([^a-z0-9]|$)');
      if (re.test(text)) { hits++; }
    }
    return hits;
  }

  var shortDesc = String(inputs.short_description || '').toLowerCase();
  var desc = String(inputs.description || '').toLowerCase();

  // Score every rule (short description counts double)
  var best = null, bestScore = 0, totalScore = 0;
  for (var r = 0; r < CONFIG.rules.length; r++) {
    var rule = CONFIG.rules[r];
    var score = countHits(shortDesc, rule.keywords) * 2 + countHits(desc, rule.keywords);
    totalScore += score;
    if (score > bestScore) { bestScore = score; best = rule; }
  }

  var confidence = totalScore > 0 ? bestScore / totalScore : 0;
  var manual = (best === null) || confidence < 0.5;

  var d = CONFIG.defaults;
  var result = (best === null)
    ? { name: 'No match', category: d.category, subcategory: d.subcategory, group: d.assignment_group, urgency: d.urgency, impact: d.impact }
    : best;

  var urgency = result.urgency, impact = result.impact;

  // Escalate when wording suggests wide or time-critical impact
  var combined = shortDesc + ' ' + desc;
  if (countHits(combined, CONFIG.escalation) > 0) {
    urgency = Math.max(1, urgency - 1);
    impact = Math.max(1, impact - 1);
  }

  outputs.category = result.category;
  outputs.subcategory = result.subcategory;
  outputs.assignment_group = manual ? d.assignment_group : result.group;
  outputs.urgency = urgency;
  outputs.impact = impact;
  outputs.priority = PRIORITY[impact][urgency];
  outputs.matched_rule = result.name;
  outputs.needs_manual_review = manual;
  outputs.work_note = 'Auto-classified by Flow Designer. Rule: ' + result.name +
    ', confidence: ' + Math.round(confidence * 100) + '%' +
    (manual ? ' (low confidence - routed to Service Desk for manual review)' : '');

})(inputs, outputs);
