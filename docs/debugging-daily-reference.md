# Debugging Daily Reference

This document is the quick reference for the debugging lessons we have covered so far. Use it beside the debugging lab:

```text
http://localhost:4203
```

Run it with:

```bash
npm run start:debugging
```

## Day 1: Debugging Mindset

Core idea:

```text
Do not debug by guessing. Identify the failing layer, collect evidence, and then choose the right tool.
```

Debugging ladder:

```text
1. Did the browser load HTML?
2. Did JavaScript load?
3. Did Angular bootstrap?
4. Did the component render?
5. Did the user event fire?
6. Did the method run?
7. Did the service run?
8. Did state update?
9. Did DOM update?
10. Did the browser show an error?
```

DevTools panels:

```text
Console      -> runtime logs and errors
Sources      -> breakpoints, state, call stack
Network      -> requests, responses, timing, initiator
Application  -> local storage, session storage, cache, service workers
Performance  -> scripting, rendering, painting, long tasks
Elements     -> DOM and CSS
```

Practice:

```text
Run console drill
Run breakpoint drill
Run HTTP/network drills
Save Application state
Run performance drill
```

Interview sentence:

```text
My debugging process starts with locating the failing layer. I use Console to inspect runtime errors and logs, Sources to prove execution path and state, Network to verify requests and responses, Application to inspect browser storage and cache, and Performance when the issue is speed rather than correctness.
```

## Day 1.5: Performance Trace Reading

Core idea:

```text
INP tells you whether the interaction was delayed. Performance trace tells you why.
```

Important places:

```text
Interactions marker -> user interaction
Main track          -> JavaScript, rendering, paint work
Bottom-up           -> what consumed most time
Call tree           -> who called what
Event log           -> what happened in order
```

Color model:

```text
Yellow  -> JavaScript / scripting
Purple  -> style recalculation / layout
Green   -> paint / compositing
```

Diagnosis:

```text
Big yellow block        -> JavaScript blocked main thread
Big purple block        -> layout/style work delayed rendering
Big green block         -> paint was expensive
Task over 50ms          -> long task
Many repeated UI updates -> Angular may be updating too much state or DOM
```

How to read a trace:

```text
1. Record interaction.
2. Find click/interaction marker.
3. Inspect Main track.
4. Click biggest block.
5. Open Bottom-up.
6. Read top expensive functions.
7. Open Call tree.
8. Find user action -> app function path.
```

Principal sentence:

```text
I separate user-perceived delay into scripting, rendering, painting, and idle time. Then I inspect the most expensive function or browser task before deciding what to optimize.
```

## Day 2: Breakpoints, Logpoints, Conditional Breakpoints, Call Stack

Core idea:

```text
Use DevTools to inspect code paths without changing source code.
```

Normal breakpoint:

```text
Use when you need to pause execution and inspect state.
```

Logpoint:

```text
Use when you want console evidence without editing code and without pausing execution.
```

Conditional breakpoint:

```text
Use when the bug appears only for specific data, timing, or repeated interactions.
```

Call stack:

```text
Shows how execution reached the current function.
```

Step controls:

```text
Resume      -> continue running
Step over   -> execute current line and pause on next line
Step into   -> enter called function
Step out    -> leave current function
```

Mac note:

```text
If F10 does not step over, try Fn + F10 or click the Step over icon.
```

Best files to practice:

```text
projects/debugging/src/app/app.ts
projects/shared-core/src/lib/logger.service.ts
projects/invoice/src/app/app.ts
```

Good breakpoint locations:

```ts
triggerBreakpointDrill()
calculateInvoiceTotal()
triggerHttpFallbackDrill()
triggerNetworkFailureDrill()
LoggerService.write()
```

Interview sentence:

```text
I use normal breakpoints when I need to pause and inspect state, logpoints when I need evidence without changing code or stopping execution, and conditional breakpoints when the bug appears only under specific data or timing. I use the call stack to understand how execution reached the failing function.
```

## Day 2.5: fetch, HTTP Status, catch, Initiator, Async Call Stack

Core idea:

```text
fetch() resolves when the browser receives an HTTP response.
fetch() rejects only when the request fails at the network/browser level.
```

This enters the `try` path:

```text
200
404
500
200 with wrong body
HTML fallback instead of JSON
```

This enters `catch`:

```text
connection refused
DNS/network failure
CORS block
aborted request
browser-level request failure
```

Always inspect:

```ts
response.ok
response.status
response.statusText
response.url
response.type
response.headers.get('content-type')
```

Important lesson from this repo:

```text
/api/debugging-lab/orders/42 can return 200 OK in local dev because Angular dev server may fallback to index.html.
```

That means:

```text
status 200 does not always mean API success.
Check content-type and response body.
```

Debugging lab buttons:

```text
Run HTTP 200 drill -> same-origin fake API route, demonstrates HTTP response handling
Run failure drill  -> localhost:59999, demonstrates network-level catch path
```

Conditional breakpoint example:

```ts
response.status === 200 && response.headers.get('content-type')?.includes('text/html')
```

Logpoint example:

```text
status={response.status}, ok={response.ok}, type={response.headers.get('content-type')}, url={response.url}
```

Network Initiator:

```text
Network -> click request -> Initiator
```

It answers:

```text
Which file/function triggered this request?
```

Async mental model:

```text
Before await:
  function starts
  browser begins request
  function pauses

After response:
  promise resolves
  function resumes after await
```

Interview sentence:

```text
fetch does not treat HTTP error status as exceptions. It resolves for HTTP responses and rejects only for network-level failures, CORS blocks, aborts, or similar browser-level failures. In debugging, I inspect response.ok, response.status, headers, and content-type, and I use Network Initiator plus async call stacks to trace which code triggered the request.
```

## Day 3: Angular State Debugging

Core idea:

```text
Separate event path, state path, render path, and CSS/browser path.
```

Angular UI chain:

```text
User action
-> component method
-> service call
-> state update
-> template re-render
-> DOM update
-> browser paint
```

Questions:

```text
Did the method run?
Did state change?
Did the service update?
Did Angular render the new state?
Did the DOM contain the right text?
Did CSS hide or override it?
```

Signal debugging:

```ts
this.events()
this.events.update(...)
computed(() => this.events().length)
```

Practice in debugging lab:

```text
Breakpoint in record()
Inspect panel, message, this.nextId, this.events()
Step over this.events.update(...)
Inspect this.events() again
Resume and confirm UI changed
```

Practice in invoice app:

```text
Breakpoint in save()
Inspect this.invoiceForm.value
Inspect amount
Inspect Number.isNaN(amount)
Inspect this.status
```

Practice in shared logger:

```text
Breakpoint in LoggerService.write()
Inspect level, source, message, data, entry
Step over entriesSignal.update(...)
Inspect this.entries()
```

Classification table:

```text
State problem:
  value is wrong in component/service

Template problem:
  value is correct in state but binding/condition is wrong

Service problem:
  component calls service but service creates wrong value

CSS/rendering problem:
  DOM is correct but hidden, clipped, covered, or styled incorrectly
```

Debugging path:

```text
1. Breakpoint in method
2. Inspect component state
3. Inspect service state
4. Inspect template binding
5. Inspect DOM in Elements
6. Inspect CSS in Computed
```

Interview sentence:

```text
When debugging Angular UI, I separate the event path from the state path and the render path. I first prove the event handler ran, then inspect component and service state, then verify template bindings and DOM output, and only then look at CSS or browser rendering. This prevents me from guessing whether the bug is in Angular state, shared service logic, or presentation.
```

## Quick Daily Report Template

Use this after each practice session:

```text
Date:
Day:
Drill:
Expected:
Actual:
Panel used:
Evidence:
Root cause or learning:
Next question:
Interview sentence:
```

## Current Learning Status

Completed:

```text
Day 1   -> debugging mindset
Day 1.5 -> Performance trace reading
Day 2   -> breakpoints, logpoints, call stack
Day 2.5 -> fetch, HTTP vs network failure, async call stack
Day 3   -> Angular state debugging
```

Next recommended day:

```text
Day 4 -> Network tab deep dive: headers, payload, response body, timing, initiator, waterfall, CORS
```
