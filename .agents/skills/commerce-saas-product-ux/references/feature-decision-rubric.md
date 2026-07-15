# Feature Decision Rubric

Use this rubric when deciding whether a feature belongs in the MVP, next release, or later.

## Scoring

Score each criterion from 0 to 2.

- 0: weak or irrelevant.
- 1: useful but not essential.
- 2: strong and central.

## Criteria

### Demo Story Fit

Does the feature strengthen the core demo path?

Core path:

`sign in -> import catalog -> process data -> search catalog -> review duplicate -> approve decision -> view audit/evaluation`

### Real Commerce Value

Does it solve a recognizable commerce/catalog/search problem?

### Senior Engineering Signal

Does it demonstrate architecture, reliability, security, evaluation, or AI engineering maturity?

### UX Wow Factor

Will it make the app feel more professional, useful, and impressive to a reviewer?

### Evidence Potential

Can the feature produce measurable or inspectable evidence?

Examples:

- Evaluation metric.
- Audit event.
- State transition.
- Quality comparison.
- Latency or reliability result.

### Implementation Risk

Is the feature achievable without destabilizing the MVP?

Reverse scoring:

- 2: low risk.
- 1: manageable risk.
- 0: high risk or unclear scope.

## Decision Bands

- 10 to 12: MVP candidate.
- 7 to 9: next release candidate.
- 4 to 6: later roadmap.
- 0 to 3: defer or reject.

## Override Rules

Always defer when:

- It requires major architecture before the core workflow works.
- It creates AI autonomy without approval.
- It cannot be explained in the portfolio.
- It adds UI surface without improving the demo story.

Always consider for MVP when:

- It strengthens tenant safety.
- It strengthens human approval.
- It turns AI claims into measurable evidence.
- It makes the main demo easier to understand.

