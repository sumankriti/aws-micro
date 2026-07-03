# aws-micro: AWS + Angular Microfrontend Roadmap

GitHub repo: `sumankriti/aws-micro`

This repo is for learning Angular microfrontends and AWS deployment together. The current Angular app is the first version of the future `shell`. It can host navigation, shared layout, auth, and runtime loading of remote apps. The invoice form can later move into an independently deployed `invoice` remote.

## Target Architecture

Start with one deployable shell:

```text
sumankriti/aws-micro
  -> GitHub Actions
  -> test + build shell
  -> S3 shell bucket
  -> CloudFront distribution
  -> Browser
```

Grow into independently deployed microfrontends:

```text
CloudFront
  /                 -> Angular shell app
  /invoice/         -> Invoice remote app
  /customers/       -> Customers remote app
  /assets/remotes/  -> remoteEntry files or native federation manifests
```

Add AWS backend practice after the frontend deployment loop works:

```text
Angular remote -> API Gateway -> Lambda -> DynamoDB
```

## Phase 1: Shell App Deployment

Goal: every push to `main` builds and deploys the shell app.

AWS resources to create:

- S3 bucket for shell static files.
- CloudFront distribution in front of the shell bucket.
- Origin Access Control so users access the app through CloudFront, not directly from S3.
- IAM role for GitHub Actions using OpenID Connect.

GitHub repository secrets or variables to configure:

- `AWS_ROLE_TO_ASSUME`
- `AWS_REGION`
- `AWS_SHELL_S3_BUCKET`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`

The starter workflow is in `.github/workflows/deploy-angular-to-aws.yml`.

## Phase 2: First Remote App

Move the invoice feature into its own Angular remote app.

Recommended path:

- Keep the current app as `shell`.
- Add a new Angular app named `invoice`.
- Serve the invoice app independently during local development.
- Deploy the invoice app to its own S3 bucket or CloudFront path.
- Teach the shell to load the invoice remote.

This teaches the core microfrontend idea: the shell and remote can be built and deployed independently.

## Phase 3: Add A Real AWS API

Replace the mocked `InvoiceService` response with an HTTP call.

Recommended path:

- Create an API Gateway HTTP API.
- Add a Lambda function with a `POST /invoices` route.
- Store invoices in DynamoDB.
- Add CORS for the CloudFront app URL.
- Put the API base URL in an Angular environment file.

This connects the remote frontend to a real AWS backend.

## Phase 4: Add More Remotes

Add another independently deployed Angular remote, for example:

- `customers`
- `reports`
- `admin`

Recommended deployment model:

- Deploy each app to its own S3 prefix or bucket.
- Put all apps behind one CloudFront distribution.
- Use path-based origins or behaviors for `/invoice/*`, `/customers/*`, and `/`.
- Deploy remotes independently from Git.

For Angular, look at native federation or module federation after the shell deployment loop works. The key idea is that the shell loads separately deployed remote code at runtime.

## Phase 5: Make Deployments Safer

Add the production habits one by one:

- Separate `dev` and `prod` AWS accounts or at least separate buckets/distributions.
- Pull request workflow that runs tests only.
- `main` workflow that deploys to dev.
- Git tag workflow that deploys to prod.
- CloudFront cache rules: long cache for hashed assets, short cache for `index.html`.
- Rollback notes: redeploy a previous Git commit or keep versioned S3 artifacts.

## Useful Commands

```bash
npm test -- --watch=false
npm run build
```

Connect this local folder to GitHub:

```bash
git remote add origin https://github.com/sumankriti/aws-micro.git
git push -u origin main
```

If Git reports dubious ownership in this folder, fix it locally with:

```bash
git config --global --add safe.directory /Users/kritisuman/Documents/learning/angular-basics
```

Only run that if you trust this repository path.
