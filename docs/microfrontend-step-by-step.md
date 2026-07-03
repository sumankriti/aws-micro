# Angular Microfrontend Step By Step

This document explains what we created in this repo and why each part exists.

## 1. What Is A Microfrontend?

A microfrontend is a frontend architecture where one large UI is split into smaller frontend applications.

Instead of one Angular app containing every feature, you can have:

- one shell app
- one invoice app
- one customers app
- one reports app

Each app can be developed, tested, built, and deployed separately.

## 2. What Is A Shell Application?

The shell application is the host or container application.

In this repo, the shell app is:

```text
projects/shell
```

The shell usually owns:

- main layout
- top navigation
- sidebar navigation
- login/auth handling
- route definitions
- loading remote microfrontends
- shared page structure

The shell should not contain every business feature. It should coordinate the application.

Example:

```text
User opens http://localhost:4200
  -> shell loads
  -> user clicks Invoice
  -> shell opens or loads invoice remote
```

## 3. What Is A Remote Application?

A remote application is a feature app that can run separately from the shell.

In this repo, we created two remote apps:

```text
projects/invoice
projects/customers
```

The invoice remote owns invoice screens and invoice logic.

The customers remote owns customer screens and customer logic.

Remote apps should be able to run independently during development. This helps different teams work without waiting on the full application.

## 4. Current Workspace Structure

This repo now has this shape:

```text
aws-micro
  angular.json
  package.json
  projects
    shell
      src
        app
    invoice
      src
        app
    customers
      src
        app
  docs
```

The original root Angular app has been removed. The microfrontend learning work is under `projects/`.

## 5. Apps We Created

### Shell

Path:

```text
projects/shell
```

Run:

```bash
npm run start:shell
```

Default URL:

```text
http://localhost:4200
```

If port `4200` is busy, run:

```bash
npx ng serve shell --port 4300
```

### Invoice Remote

Path:

```text
projects/invoice
```

Run:

```bash
npm run start:invoice
```

URL:

```text
http://localhost:4201
```

### Customers Remote

Path:

```text
projects/customers
```

Run:

```bash
npm run start:customers
```

URL:

```text
http://localhost:4202
```

## 6. How We Created The Apps

The Angular CLI commands are:

```bash
npx ng generate application shell --routing --style=css --skip-install
npx ng generate application invoice --routing --style=css --skip-install
npx ng generate application customers --routing --style=css --skip-install
```

These commands added three applications to the same Angular workspace.

Angular updated:

```text
angular.json
tsconfig.json
projects/
```

## 7. Useful NPM Scripts

The project has scripts in `package.json`.

Run shell:

```bash
npm run start:shell
```

Run invoice:

```bash
npm run start:invoice
```

Run customers:

```bash
npm run start:customers
```

Build shell:

```bash
npm run build:shell
```

Build invoice:

```bash
npm run build:invoice
```

Build customers:

```bash
npm run build:customers
```

Build all:

```bash
npm run build:all
```

## 8. Current State Of This Repo

Right now, we have separate Angular applications.

Current behavior:

- shell runs independently
- invoice runs independently
- customers runs independently
- shell links to the remote apps by URL

What we have not added yet:

- runtime federation
- shared libraries
- remote module loading
- AWS hosting for each app

This is intentional. First we learn the structure. Then we add runtime loading.

## 9. Next Microfrontend Step

The next step is to make the shell load remote apps at runtime.

There are two common Angular options:

- Native Federation
- Module Federation

After adding federation, the architecture becomes:

```text
shell
  -> loads invoice remote at runtime
  -> loads customers remote at runtime
```

The shell can show routes like:

```text
/
/invoice
/customers
```

But the code for `/invoice` comes from the invoice app, and the code for `/customers` comes from the customers app.

## 10. How AWS Fits In Later

Once the apps build correctly, each app can be deployed separately.

Simple AWS deployment model:

```text
GitHub Actions
  -> build shell
  -> upload shell to S3
  -> serve shell with CloudFront
```

Then add remotes:

```text
GitHub Actions
  -> build invoice
  -> upload invoice to S3
  -> serve invoice through CloudFront /invoice/

GitHub Actions
  -> build customers
  -> upload customers to S3
  -> serve customers through CloudFront /customers/
```

Final target:

```text
CloudFront
  /          -> shell
  /invoice/  -> invoice remote
  /customers/ -> customers remote
```

## 11. Learning Order

Use this order:

1. Understand shell vs remote apps.
2. Run all apps locally.
3. Fix production builds.
4. Add runtime federation.
5. Deploy shell to AWS.
6. Deploy invoice remote to AWS.
7. Deploy customers remote to AWS.
8. Add API Gateway, Lambda, and DynamoDB for real backend data.

This keeps the learning path clean and avoids mixing too many new concepts at once.

## 12. Sharing A Core Service

Cross-cutting services should live in a shared library instead of being copied into each remote.

This repo has a shared library:

```text
projects/shared-core
```

The logger service lives here:

```text
projects/shared-core/src/lib/logger.service.ts
```

It is exported from:

```text
projects/shared-core/src/public-api.ts
```

Invoice and customers import it like this:

```ts
import { LoggerService } from 'shared-core';
```

Then they inject it:

```ts
private readonly logger = inject(LoggerService);
```

Use this pattern for stable platform services such as logging, auth context, telemetry, feature flags, and API configuration. Avoid using it for domain services like invoice saving or customer search, because that creates tight coupling between remotes.
