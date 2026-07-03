# Principal Engineer Interview Guide: Angular Microfrontends On AWS

This guide helps you use this repo as an interview story for a Principal Engineer role. The goal is not just to say "I used Angular microfrontends." The goal is to explain why the architecture exists, what tradeoffs it creates, and how you would operate it safely at scale.

## 1. Your One-Minute Architecture Pitch

Use this as your crisp opening answer:

```text
I designed the frontend as a microfrontend architecture with an Angular shell and independently deployable remote applications. The shell owns global concerns like navigation, authentication boundaries, layout, and runtime composition. Business capabilities such as invoice and customers are isolated into remote apps so teams can develop, test, and deploy them independently.

On AWS, I would host each built Angular app as static assets in S3 and serve them through CloudFront. GitHub Actions would build, test, and deploy each app independently using OIDC-based AWS authentication. For backend integration, remotes would call API Gateway endpoints backed by Lambda and DynamoDB, with observability, rollback, and cache invalidation designed into the deployment process.
```

## 2. What A Principal Engineer Should Emphasize

At principal level, interviewers are listening for:

- technical depth
- architectural judgment
- tradeoff awareness
- risk management
- operational maturity
- team and platform thinking
- migration strategy
- security and cost awareness

Do not explain only the code. Explain the system.

## 3. Current Repo Architecture

This repo has:

```text
projects/shell      -> host application
projects/invoice    -> invoice remote
projects/customers  -> customers remote
```

Current state:

- each app runs independently
- shell links to the remote apps
- federation/runtime loading is the next architectural step
- AWS deployment will come after production builds are stable

This is a good interview artifact because it shows an incremental approach rather than a big-bang architecture.

## 4. Shell Application Responsibilities

The shell is the composition layer.

It should own:

- global navigation
- layout and page frame
- authentication initiation
- route-level authorization checks
- remote app discovery
- shared error boundaries
- fallback UI if a remote fails
- global telemetry setup

It should avoid:

- owning business feature logic
- importing every remote at build time
- becoming a shared dumping ground
- tightly coupling to remote implementation details

Strong interview sentence:

```text
The shell should be stable, boring, and thin. Its job is composition and cross-cutting concerns, not business feature ownership.
```

## 5. Remote Application Responsibilities

A remote app owns one business capability.

Examples:

- invoice owns invoice creation, validation, and invoice API calls
- customers owns customer list, search, and customer profile workflows

Each remote should be:

- independently runnable
- independently testable
- independently deployable
- owned by a clear team or domain boundary
- versioned and observable

Strong interview sentence:

```text
I would align microfrontends with business domains, not just UI pages, because ownership boundaries matter more than folder boundaries.
```

## 6. Why Use Microfrontends?

Good reasons:

- independent team delivery
- reduced coordination for releases
- separate deployability for business domains
- ability to modernize one area at a time
- smaller blast radius for some frontend changes
- clearer ownership in large organizations

Bad reasons:

- because it is fashionable
- for a small app with one team
- to avoid code cleanup
- when shared state is not well understood
- when deployment maturity is weak

Principal-level answer:

```text
Microfrontends are an organizational scaling pattern as much as a technical pattern. I would only introduce them when team autonomy, release independence, or incremental modernization justify the added complexity.
```

## 7. Tradeoffs And Risks

Microfrontends introduce complexity.

Important tradeoffs:

- More deployments to operate.
- Shared dependencies can become version conflicts.
- UI consistency needs governance.
- Runtime loading can fail independently.
- Observability must work across app boundaries.
- Auth and routing need careful contracts.
- Performance can suffer if remotes are too heavy.

How to mitigate:

- define ownership clearly
- create a shared design system
- keep shell contracts small
- add contract tests between shell and remotes
- monitor remote loading failures
- use semantic versioning for shared libraries
- set performance budgets per app

## 8. AWS Deployment Architecture

Simple target:

```text
GitHub Actions
  -> build shell
  -> upload to S3
  -> serve through CloudFront

GitHub Actions
  -> build invoice
  -> upload to S3 or S3 prefix
  -> serve through CloudFront /invoice/

GitHub Actions
  -> build customers
  -> upload to S3 or S3 prefix
  -> serve through CloudFront /customers/
```

AWS components:

- S3 for static assets
- CloudFront for CDN and routing
- Origin Access Control for private S3 access
- IAM role with GitHub OIDC
- CloudWatch for metrics/logs
- API Gateway for backend APIs
- Lambda for serverless backend logic
- DynamoDB for persistence

Strong interview sentence:

```text
I would avoid long-lived AWS keys in GitHub and use OIDC-based role assumption from GitHub Actions into AWS.
```

## 9. CI/CD Strategy

For a principal-level answer, describe more than "run npm build."

Pipeline stages:

```text
pull request
  -> install
  -> lint
  -> unit tests
  -> affected app tests
  -> build validation

main branch
  -> test
  -> build
  -> deploy to dev
  -> smoke test

release tag
  -> deploy to prod
  -> invalidate CloudFront
  -> publish release notes
```

Rollback strategy:

- keep previous build artifacts
- redeploy previous Git SHA
- invalidate CloudFront after rollback
- keep remote manifest versioned

## 10. Caching Strategy

For Angular static assets:

- hashed JS/CSS files can be cached for a long time
- `index.html` should have short cache or no-cache behavior
- remote manifests should have short cache
- CloudFront invalidation should target changed entry files when possible

Why this matters:

```text
If index.html or remote manifests are cached too aggressively, users can receive an old shell pointing to missing or incompatible remote assets.
```

## 11. Security Talking Points

Frontend:

- Content Security Policy
- secure auth flow
- avoid tokens in localStorage when possible
- sanitize user-controlled content
- restrict remote origins
- use HTTPS everywhere

AWS:

- private S3 buckets
- CloudFront Origin Access Control
- least-privilege IAM roles
- GitHub OIDC instead of static credentials
- separate dev/prod accounts or boundaries
- API Gateway authorization
- CloudTrail auditing

Principal-level answer:

```text
In microfrontends, security is partly about controlling which remotes the shell is allowed to load and ensuring deployment pipelines cannot publish untrusted assets.
```

## 12. Observability

A principal engineer should mention observability early.

Track:

- shell load time
- remote load time
- remote load failure rate
- route-level errors
- API latency
- API failure rate
- CloudFront cache hit ratio
- deployment frequency
- rollback frequency

Frontend telemetry should include:

- app name
- app version
- route
- remote name
- Git SHA
- correlation ID for API calls

Strong interview sentence:

```text
Every remote should identify itself in logs and telemetry so production issues can be routed to the owning team quickly.
```

## 13. Performance Concerns

Microfrontends can hurt performance if each remote ships duplicate dependencies.

Discuss:

- shared Angular dependencies
- lazy loading
- bundle budgets
- prefetching critical remotes
- avoiding too many remotes on first load
- image and asset optimization
- measuring Core Web Vitals

Good answer:

```text
I would optimize for fast shell startup, lazy-load business remotes, and use performance budgets to stop each team from unknowingly increasing the shared user cost.
```

## 14. Common Interview Questions

### Why not use a monolith frontend?

Answer:

```text
For a small team, I would choose a monolith. I would use microfrontends when team autonomy, independent deployment, and domain ownership are more valuable than the added platform complexity.
```

### What does the shell own?

Answer:

```text
The shell owns composition: navigation, layout, auth boundaries, route registration, remote loading, and global telemetry. It should not own business features.
```

### How do you deploy remotes independently?

Answer:

```text
Each remote has its own build pipeline and deploys static assets to S3. CloudFront exposes the shell and remotes under stable paths. The shell loads remote metadata or remote entry files at runtime.
```

### How do you prevent breaking the shell?

Answer:

```text
I would keep the shell-to-remote contract small, add contract tests, version remote manifests, and use canary or dev environments before production rollout.
```

### How do teams share UI components?

Answer:

```text
I would use a versioned design system or shared component library, but I would avoid turning shared libraries into a hidden monolith. Shared code should be stable, intentional, and backward compatible.
```

### How do you handle authentication?

Answer:

```text
The shell should initiate and own the authentication session. Remotes should consume auth state through a controlled contract or API layer rather than each remote implementing its own login flow.
```

### What happens if one remote is down?

Answer:

```text
The shell should show a route-level fallback for that remote, log the failure, and keep the rest of the application usable.
```

## 15. Design Exercise Template

If asked to design an Angular microfrontend platform, structure your answer like this:

1. Clarify scale and teams.
2. Define business domains.
3. Choose shell responsibilities.
4. Choose remote boundaries.
5. Define runtime loading approach.
6. Define CI/CD and AWS hosting.
7. Define security model.
8. Define observability.
9. Define rollback strategy.
10. Explain tradeoffs.

This structure sounds principal-level because it covers both design and operation.

## 16. How To Use This Repo In An Interview

You can say:

```text
I created a small reference repo to demonstrate how I would evolve an Angular application toward microfrontends. It starts with a shell, invoice remote, and customers remote in one workspace. The next steps are to add runtime federation, deploy each app independently to AWS S3 and CloudFront, then connect the invoice remote to API Gateway, Lambda, and DynamoDB.
```

Then discuss what you would improve:

- fix production build stability
- add federation
- add linting
- add e2e smoke tests
- add contract tests
- add AWS infrastructure as code
- add observability
- add separate dev/prod environments

## 17. Principal Engineer Takeaway

Your strongest message:

```text
I do not treat microfrontends as a default. I use them when they match team topology, domain ownership, and deployment independence. The architecture must include CI/CD, security, observability, rollback, and governance from the beginning, otherwise it only moves monolith problems into production operations.
```
