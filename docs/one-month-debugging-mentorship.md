# One Month Debugging Mentorship

This is a 30-day learning plan for becoming strong at frontend and cloud debugging. Treat me as your principal engineer mentor and this repo as your lab.

## Mentor Contract

Your goal is not to memorize tools. Your goal is to build debugging judgment.

Every debugging session should answer:

```text
What is broken?
Where is the evidence?
What layer owns the failure?
What is the smallest experiment that proves the cause?
What is the safest fix?
How do we prevent this class of bug again?
```

## Daily Debugging Ritual

Spend 45-60 minutes daily:

1. Reproduce the behavior.
2. Write a one-sentence hypothesis.
3. Pick one DevTools panel.
4. Capture evidence.
5. Explain the root cause out loud.
6. Write one note in your debugging journal.

Use this format:

```text
Date:
Bug:
Expected:
Actual:
Evidence:
Root cause:
Fix:
Prevention:
Interview sentence:
```

## Week 1: Browser And Angular Fundamentals

Goal: become comfortable proving frontend behavior in Chrome DevTools.

### Day 1: Debugging Mindset

Read:

```text
docs/chrome-devtools-debugging-deep-dive.md
```

Practice:

- Run `debugging` app on port `4203`.
- Open Console.
- Run every drill once.
- Explain which DevTools panel proves each behavior.

Deliverable:

```text
I can explain Console, Sources, Network, Application, and Performance in one sentence each.
```

### Day 2: Console Mastery

Practice:

- Run Console drill.
- Filter by `debugging`.
- Compare `console.log`, `console.warn`, `console.error`, and `console.table`.
- Inspect shared `LoggerService` output.

Principal question:

```text
How would you make production browser logs useful without leaking sensitive data?
```

### Day 3: Breakpoints And Call Stack

Practice:

- Break in `triggerBreakpointDrill()`.
- Break in `calculateInvoiceTotal()`.
- Step over and step into.
- Inspect Call Stack.

Deliverable:

```text
I can distinguish where a bug originates from where it becomes visible.
```

### Day 4: Angular State

Practice:

- Break in invoice `save()`.
- Inspect `invoiceForm.value`.
- Enter invalid amount.
- Watch `Number.isNaN(amount)`.

Principal question:

```text
How do you prove whether a UI bug is caused by state, template rendering, or CSS?
```

### Day 5: Network Basics

Practice:

- Open Network.
- Disable cache.
- Reload debugging app.
- Run Network drill.
- Inspect failed `/api/debugging-lab/orders/42` request.

Deliverable:

```text
I can explain status, initiator, timing, payload, and response.
```

### Day 6: Application Storage

Practice:

- Save student name in debugging app.
- Inspect Application -> Local Storage.
- Clear site data.
- Reload and observe behavior.

Principal question:

```text
When can local storage cause production-only bugs?
```

### Day 7: Week 1 Review

Mock interview prompt:

```text
Walk me through how you debug a button click that does not update the UI.
```

Expected answer shape:

```text
I verify the DOM, Console, event handler breakpoint, component state, service call, and template binding in that order.
```

## Week 2: Microfrontend Debugging

Goal: debug across shell, remotes, and shared libraries.

### Day 8: Shell Vs Remote Failure

Practice:

- Run shell, invoice, customers, debugging.
- Open shell.
- Open each remote.
- Stop one remote.
- Observe shell link behavior.

Principal question:

```text
How should a shell behave when one remote fails?
```

### Day 9: Shared Service Debugging

Practice:

- Break in `LoggerService.write()`.
- Trigger invoice save.
- Trigger customer selection.
- Trigger debugging console drill.

Deliverable:

```text
I can prove multiple apps call shared-core code.
```

### Day 10: Source Maps

Practice:

- Open Sources.
- Find TypeScript files.
- Set breakpoint in TypeScript, not generated JavaScript.

Principal question:

```text
Would you deploy source maps to production? Why or why not?
```

### Day 11: CSS Isolation

Practice:

- Inspect invoice and customers pages.
- Change styles live.
- Identify global styles vs component styles.

Deliverable:

```text
I can explain how CSS leakage can break microfrontends.
```

### Day 12: Runtime Error Isolation

Practice:

- Temporarily add a thrown error in debugging app.
- Observe Console.
- Remove it.

Rule:

```text
Never commit intentional broken code unless it is behind a safe training toggle.
```

### Day 13: Performance Basics

Practice:

- Run Performance drill.
- Record in Performance panel.
- Identify scripting time.

Principal question:

```text
How can independent remotes accidentally make the whole app slow?
```

### Day 14: Week 2 Review

Mock interview prompt:

```text
An invoice remote is blank in production but shell loads. How do you debug?
```

Expected answer:

```text
Check shell route, remote asset URL, Network status, Console errors, remote manifest, cache, and whether other remotes still work.
```

## Week 3: AWS Deployment Debugging

Goal: understand deployment failures from GitHub to browser.

### Day 15: Deployment Pipeline Reading

Read:

```text
.github/workflows/deploy-angular-to-aws.yml
docs/aws-deployment-debugging-deep-dive.md
```

Explain each workflow step out loud.

### Day 16: GitHub Actions Debugging

Practice:

- Read a GitHub Actions log.
- Identify install, test, build, AWS auth, upload, invalidation phases.

Principal question:

```text
How do you know whether a deployment failed before or after artifact creation?
```

### Day 17: IAM And OIDC

Practice:

- Explain why OIDC is safer than long-lived AWS keys.
- Write the trust policy subject for this repo.

Deliverable:

```text
repo:sumankriti/aws-micro:ref:refs/heads/main
```

### Day 18: S3 Debugging

Practice:

- Learn `aws s3 sync --dryrun`.
- Explain `--delete`.
- Explain wrong build path failures.

Principal question:

```text
What is the blast radius of an incorrect aws s3 sync --delete?
```

### Day 19: CloudFront Debugging

Practice:

- Explain 403 vs 404.
- Explain default root object.
- Explain SPA fallback.
- Explain invalidation.

### Day 20: Cache Debugging

Practice:

- In DevTools Network, disable cache.
- Compare browser cache vs CloudFront cache.
- Explain why `index.html` should not be cached like hashed JS.

### Day 21: Week 3 Review

Mock interview prompt:

```text
Deployment succeeded, but users still see the old app. Debug it.
```

Expected answer:

```text
Check deployed Git SHA, S3 object timestamps, CloudFront invalidation status, cache headers, browser cache, and index.html references.
```

## Week 4: Principal Engineer Debugging Judgment

Goal: move from tool user to debugging leader.

### Day 22: Incident Triage

Practice:

- Write severity levels.
- Decide who owns shell, invoice, customers, shared-core.
- Define escalation path.

### Day 23: Observability Design

Design:

```text
app name
app version
Git SHA
route
remote name
correlation ID
user-safe error category
```

### Day 24: Reproduction Strategy

Practice:

- Write minimal reproduction steps.
- Separate environment, data, and code causes.

Principal sentence:

```text
The faster we can reproduce, the faster we can reduce speculation.
```

### Day 25: Root Cause Analysis

Use this format:

```text
What happened?
Why did it happen?
Why did tests not catch it?
Why did monitoring not catch it earlier?
What will prevent recurrence?
```

### Day 26: Debugging Performance

Practice:

- Record Performance trace.
- Identify long task.
- Explain user impact.
- Propose bundle budget or lazy loading prevention.

### Day 27: Debugging Security

Practice:

- Inspect Application storage.
- Explain why sensitive tokens in local storage are risky.
- Explain CSP and remote origin restrictions.

### Day 28: Debugging As A Leader

Practice:

- Explain a bug to a product manager.
- Explain the same bug to a staff engineer.
- Explain the same bug to an incident commander.

### Day 29: Full Mock Scenario

Scenario:

```text
Shell loads from CloudFront. Invoice remote is blank. Some users see it, others do not. Customers remote works.
```

Your answer should cover:

- CloudFront cache
- browser cache
- remote asset path
- remote deploy version
- Console chunk errors
- Network status
- rollback
- owner escalation

### Day 30: Principal Debugging Interview

Prepare this answer:

```text
My debugging approach is evidence-first. I start at the user-visible symptom, identify the failing boundary, and use the right tool to prove or disprove each hypothesis. In browser issues, I use DevTools Network, Console, Sources, Application, and Performance. In deployment issues, I trace the path from GitHub Actions to S3 to CloudFront to the browser. In microfrontends, I isolate shell vs remote vs shared-library failures and make sure ownership, observability, and rollback are built into the architecture.
```

## Weekly Scorecard

Score yourself from 1-5:

```text
Can I reproduce issues reliably?
Can I use DevTools without guessing?
Can I explain network failures?
Can I debug Angular state?
Can I isolate shell vs remote failures?
Can I debug cache issues?
Can I explain AWS deployment failures?
Can I lead an incident calmly?
```

## What Pro Looks Like

You are becoming pro when you:

- ask better questions
- prove before changing code
- know which layer owns the failure
- can explain issues simply
- can create prevention, not just fixes
- can teach someone else the debugging path
