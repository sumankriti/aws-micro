# Chrome DevTools Debugging Deep Dive

This guide teaches frontend debugging using this Angular microfrontend repo.

Apps:

```text
shell      -> http://localhost:4200 or http://localhost:4300
invoice    -> http://localhost:4201
customers  -> http://localhost:4202
debugging  -> http://localhost:4203
```

Shared logger:

```text
projects/shared-core/src/lib/logger.service.ts
```

## 1. Debugging Mindset

Do not start by guessing. Start by locating the failing layer:

```text
HTML loaded?
JavaScript loaded?
Angular bootstrapped?
Component rendered?
User event fired?
Service method called?
Network request made?
State updated?
DOM updated?
Console error?
```

Most frontend bugs become easier when you ask:

```text
What did I expect the browser to do?
What did the browser actually do?
Which DevTools panel can prove that?
```

## 2. DevTools Panels You Must Master

For this repo, focus on:

- Elements: inspect DOM and CSS.
- Console: read logs and runtime errors.
- Sources: set breakpoints and step through TypeScript.
- Network: inspect loaded files and API requests.
- Application: inspect storage, cache, and service workers.
- Performance: analyze slow rendering and long tasks.
- Lighthouse: get high-level quality/performance signals.

## 3. Opening DevTools

Mac:

```text
Command + Option + I
```

Or:

```text
Right click page -> Inspect
```

Useful shortcuts:

```text
Command + R                  reload
Command + Shift + R          hard reload
Command + Option + J         console
Command + Option + C         inspect element
```

When debugging cache, open DevTools first, then right-click reload and choose:

```text
Empty Cache and Hard Reload
```

## 4. Start The Apps

Run each app:

```bash
npm run start:shell
npm run start:invoice
npm run start:customers
```

If shell port `4200` is busy:

```bash
npx ng serve shell --port 4300
```

Open:

```text
http://localhost:4201
http://localhost:4202
```

## 5. Console Panel: Debug LoggerService

Open invoice:

```text
http://localhost:4201
```

Open DevTools -> Console.

Click:

```text
Save invoice
```

Expected console message:

```text
[invoice] Invoice draft saved
```

Now enter an invalid amount:

```text
abc
```

Click Save again.

Expected console warning:

```text
[invoice] Invoice save rejected because amount is invalid
```

Why this matters:

```text
Console proves whether the event reached the component and whether the shared logger service executed.
```

## 6. Console Filtering

Use the Console filter box:

```text
invoice
customers
warn
error
```

Use levels:

```text
Verbose
Info
Warnings
Errors
```

Interview-quality habit:

```text
Filter by source or correlation ID so production logs stay usable.
```

## 7. Sources Panel: Breakpoint In Invoice Save

Open:

```text
http://localhost:4201
```

Go to DevTools -> Sources.

Find:

```text
projects/invoice/src/app/app.ts
```

Set a breakpoint inside:

```ts
save() {
```

Click Save invoice.

Chrome should pause execution.

Inspect:

```text
this.invoiceForm.value.customer
this.invoiceForm.value.amount
amount
this.status
```

Step controls:

```text
Step over       -> run next line
Step into       -> enter function call
Step out        -> leave function
Resume          -> continue execution
```

## 8. Sources Panel: Breakpoint In Shared Logger

Set a breakpoint in:

```text
projects/shared-core/src/lib/logger.service.ts
```

Inside:

```ts
private write(...)
```

Then trigger:

```text
invoice -> Save invoice
customers -> click customer row
```

This proves both microfrontends call the same shared service code.

Important nuance:

```text
During local development, each app has its own browser runtime. The code is shared from the same library source, but each app has its own LoggerService instance because they run on different ports as separate Angular apps.
```

When runtime federation is added later, singleton sharing becomes an architectural decision.

## 9. Watch Expressions

While paused in `save()`, add watch expressions:

```text
this.invoiceForm.value
this.status
amount
Number.isNaN(amount)
```

Watch expressions are useful when you want to observe state while stepping through code.

## 10. Call Stack

When paused, inspect Call Stack.

For the invoice save click, you should see a path similar to:

```text
button click
Angular event handling
App.save
LoggerService.info
LoggerService.write
```

The exact stack may vary, but the important skill is understanding who called whom.

Principal-level debugging sentence:

```text
I use the call stack to distinguish where the bug originates from and where it merely becomes visible.
```

## 11. Network Panel: Understand App Loading

Open Network tab, then reload.

Look for:

```text
index.html
main.js
styles.css
favicon.ico
```

In local dev mode, files may not look like production hashed files. In AWS production, you will see hashed assets like:

```text
main.ABC123.js
styles.DEF456.css
```

Click a request and inspect:

```text
Headers
Preview
Response
Timing
Initiator
```

Important columns:

```text
Status
Type
Initiator
Size
Time
Waterfall
```

## 12. Network Panel: Disable Cache

With DevTools open:

```text
Network -> Disable cache
```

Use this when:

- latest code is not showing
- CSS seems stale
- JavaScript chunk errors appear after deployment
- CloudFront/browser cache may be confusing the test

Remember:

```text
Disable cache only works while DevTools is open.
```

## 13. Network Panel: Simulate Slow Network

In Network tab:

```text
No throttling -> Slow 3G or custom profile
```

Use this to test:

- initial app load
- remote app loading
- large bundle impact
- user experience on weaker networks

Principal-level debugging sentence:

```text
Microfrontend architectures must be measured under realistic network conditions because independent deployability can accidentally create duplicated dependency cost.
```

## 14. Network Panel: Future API Debugging

When invoice later calls AWS API Gateway, debug requests here:

```text
POST /invoices
GET /customers
```

Check:

```text
Request URL
Request method
Status code
Request payload
Response body
CORS headers
Authorization header
Timing
```

Common frontend/API failures:

```text
401 -> auth token missing or expired
403 -> user or role unauthorized
404 -> wrong API path/stage
415 -> content-type mismatch
429 -> throttling
500 -> backend exception
CORS error -> browser blocked response before JS could read it
```

## 15. Elements Panel: Inspect Rendered State

Open invoice page.

Use Elements panel to inspect:

```text
<main class="remote">
<form>
<p class="status">
<section class="log-panel">
```

Change CSS live:

```css
background: white;
border: 2px solid red;
```

This helps answer:

```text
Is the DOM missing?
Is CSS hiding it?
Is layout pushing it offscreen?
Is Angular rendering wrong data?
```

## 16. Elements Panel: Debug CSS

Use Styles and Computed tabs.

Check:

```text
which CSS rule applies
which CSS rule is crossed out
box model
margin
padding
width
height
color contrast
```

For microfrontends:

```text
CSS leakage is a common risk. Remotes should avoid global styles that accidentally affect shell or other remotes.
```

## 17. Application Panel

Use Application panel to inspect:

```text
Local Storage
Session Storage
Cookies
IndexedDB
Cache Storage
Service Workers
Clear storage
```

This repo does not yet store auth/session data, but later AWS/auth work will.

Use Application panel when:

- user session looks stale
- wrong feature flag is active
- old cached app is loaded
- service worker is serving old assets
- local storage contains bad data

## 18. Clear Site Data

Application -> Storage -> Clear site data.

Use when:

```text
hard reload does not fix stale behavior
auth state is corrupted
service worker cache is suspicious
local storage state is stale
```

For local apps, clear data per origin:

```text
http://localhost:4201
http://localhost:4202
```

Each port is a different origin.

## 19. Performance Panel

Use Performance when the app is slow, not when it is functionally broken.

Record:

1. Open Performance.
2. Click record.
3. Perform user action.
4. Stop recording.
5. Inspect Main thread.

Look for:

```text
long tasks
slow scripting
layout recalculation
style recalculation
paint cost
large JavaScript execution blocks
```

For microfrontends, ask:

```text
Did the shell load quickly?
Did the remote add too much JavaScript?
Is the same dependency duplicated?
```

## 20. Lighthouse

Use Lighthouse for broad checks:

```text
Performance
Accessibility
Best Practices
SEO
```

Use it after the app works functionally.

Do not treat Lighthouse as the only source of truth. Use it as a signal generator.

## 21. DevTools Debugging Exercises

### Exercise 1: Valid Invoice Save

1. Open `http://localhost:4201`.
2. Open Console.
3. Click Save invoice.
4. Confirm console log appears.
5. Confirm log appears in UI.
6. Set breakpoint in `LoggerService.write`.
7. Click Save again.
8. Inspect `entry`.

### Exercise 2: Invalid Invoice Amount

1. Put `abc` in Amount.
2. Click Save.
3. Confirm status says amount must be a number.
4. Confirm warning log appears.
5. Breakpoint in `save()`.
6. Inspect `Number.isNaN(amount)`.

### Exercise 3: Customer Selection

1. Open `http://localhost:4202`.
2. Open Console.
3. Click a customer row.
4. Confirm `[customers] Customer selected`.
5. Breakpoint in `selectCustomer`.
6. Inspect `customer`.

### Exercise 4: Network Load

1. Open Network.
2. Disable cache.
3. Reload.
4. Confirm `index.html`, `main.js`, and `styles.css`.
5. Check request timing.

### Exercise 5: Slow Network

1. Network -> Slow 3G.
2. Reload invoice app.
3. Observe load time.
4. Reset to No throttling.

## 22. How This Maps To AWS Later

Local DevTools debugging maps directly to AWS:

```text
Local index.html      -> S3 index.html
Local main.js         -> S3/CloudFront JS asset
Local browser cache   -> CloudFront/browser cache
Local console error   -> production runtime error
Local API request     -> API Gateway request
Local CORS issue      -> API Gateway/Lambda CORS config
```

When deployed to AWS, Network is your first panel:

```text
Did CloudFront return index.html?
Did JS chunks load?
Did remote manifest load?
Did API calls succeed?
Are cache headers correct?
```

Then Console:

```text
Did Angular bootstrap?
Did remote loading fail?
Did a runtime exception stop rendering?
```

## 23. Interview-Level Answer

Use this:

```text
My frontend debugging flow starts in the browser. I use Network to verify what the browser actually loaded, Console to inspect runtime failures, Sources to prove code path and state, Application to inspect cache and storage, and Performance when the issue is speed rather than correctness. For microfrontends, I pay special attention to remote loading, duplicate dependencies, cache invalidation, and whether failures are isolated to one remote or affect the shell.
```

## 24. Official References

- Chrome DevTools Network: https://developer.chrome.com/docs/devtools/network/
- Chrome DevTools Console: https://developer.chrome.com/docs/devtools/console/
- Chrome DevTools JavaScript debugging: https://developer.chrome.com/docs/devtools/javascript/
- Chrome DevTools Application panel: https://developer.chrome.com/docs/devtools/application/
