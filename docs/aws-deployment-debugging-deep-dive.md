# AWS Deployment And Debugging Deep Dive

This guide teaches AWS deployment and debugging for this Angular microfrontend repo.

Repo:

```text
sumankriti/aws-micro
```

Apps:

```text
projects/shell
projects/invoice
projects/customers
projects/shared-core
```

## 1. Target Deployment Architecture

Start simple:

```text
GitHub Actions
  -> npm ci
  -> npm test -- --watch=false
  -> npm run build:shell
  -> aws s3 sync dist/shell/browser s3://SHELL_BUCKET
  -> CloudFront invalidation
  -> user opens CloudFront URL
```

Then grow into microfrontends:

```text
CloudFront distribution
  /             -> shell app
  /invoice/     -> invoice remote
  /customers/   -> customers remote
```

AWS services:

- S3 stores static Angular build files.
- CloudFront serves files globally.
- IAM controls GitHub Actions deployment permissions.
- GitHub OIDC avoids long-lived AWS keys.
- CloudFront invalidation clears cached entry files after deploy.

## 2. Why S3 + CloudFront?

Angular builds into static files:

```text
index.html
main.*.js
styles.*.css
assets/*
```

Static files do not need EC2, ECS, or Kubernetes for the first deployment. S3 + CloudFront is cheaper, simpler, and enough for frontend hosting.

Principal-level explanation:

```text
For static frontend assets, I prefer S3 as durable origin storage and CloudFront as the public CDN layer. This separates storage, edge delivery, TLS, caching, and access control cleanly.
```

## 3. Important AWS Resources

Create these first for the shell:

```text
S3 bucket
CloudFront distribution
CloudFront Origin Access Control
IAM OIDC provider for GitHub
IAM role for GitHub Actions
IAM policy for S3 upload and CloudFront invalidation
```

Do not make the S3 bucket public for production-style learning. Prefer private S3 with CloudFront Origin Access Control.

## 4. GitHub OIDC Concept

Bad approach:

```text
Store AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in GitHub secrets
```

Better approach:

```text
GitHub Actions gets short-lived credentials through OIDC
AWS IAM role trusts only this repo/branch/environment
```

Your workflow already has the important permission:

```yaml
permissions:
  id-token: write
  contents: read
```

`id-token: write` lets GitHub request an OIDC token. It does not by itself grant AWS access. AWS access comes only after AWS IAM trusts that token and allows role assumption.

## 5. IAM Trust Policy Shape

For this repo, the trust policy should restrict access to:

```text
repo:sumankriti/aws-micro:ref:refs/heads/main
```

Conceptual trust condition:

```json
{
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:sub": "repo:sumankriti/aws-micro:ref:refs/heads/main"
  }
}
```

Principal-level explanation:

```text
I scope the deployment role to the exact repository and branch or environment. That keeps a compromised or unrelated workflow from assuming the same AWS role.
```

## 6. IAM Permission Policy Shape

For shell deployment, the GitHub role needs:

```text
s3:ListBucket
s3:PutObject
s3:DeleteObject
cloudfront:CreateInvalidation
```

Scope permissions to:

```text
arn:aws:s3:::YOUR_SHELL_BUCKET
arn:aws:s3:::YOUR_SHELL_BUCKET/*
arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID
```

Avoid broad policies like:

```text
s3:*
cloudfront:*
Resource: *
```

## 7. Current GitHub Actions Workflow

Current workflow:

```text
.github/workflows/deploy-angular-to-aws.yml
```

Important steps:

```yaml
- name: Install dependencies
  run: npm ci

- name: Test
  run: npm test -- --watch=false

- name: Build
  run: npm run build:shell

- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4

- name: Upload shell static assets
  run: aws s3 sync dist/shell/browser s3://${{ vars.AWS_SHELL_S3_BUCKET }} --delete

- name: Invalidate CloudFront cache
  run: aws cloudfront create-invalidation --distribution-id ${{ vars.AWS_CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

GitHub variables/secrets needed:

```text
secret: AWS_ROLE_TO_ASSUME
var: AWS_REGION
var: AWS_SHELL_S3_BUCKET
var: AWS_CLOUDFRONT_DISTRIBUTION_ID
```

## 8. First Deployment Checklist

Use this order:

1. Fix local production build.
2. Create S3 bucket for shell.
3. Create CloudFront distribution.
4. Configure Origin Access Control.
5. Create GitHub OIDC provider in IAM.
6. Create deployment IAM role.
7. Add least-privilege IAM policy.
8. Add GitHub repo variables/secrets.
9. Push to `main`.
10. Watch GitHub Actions logs.
11. Open CloudFront URL.

## 9. Debugging Mental Model

When deployment fails, locate the layer:

```text
Code/build problem?
GitHub Actions problem?
AWS authentication problem?
S3 upload problem?
CloudFront cache/routing problem?
Browser/runtime problem?
```

Do not debug randomly. Walk the pipeline in order.

## 10. Debugging GitHub Actions

Common symptoms:

### npm ci fails

Likely causes:

- `package-lock.json` out of sync with `package.json`
- Node version mismatch
- private package auth issue
- corrupted lockfile

Debug:

```bash
npm ci
npm test -- --watch=false
```

### Tests fail in CI but pass locally

Check:

- Node version
- case-sensitive file paths
- missing environment variables
- test order dependency
- timezone assumptions

### AWS credentials step fails

Likely causes:

- `AWS_ROLE_TO_ASSUME` is wrong
- IAM OIDC provider missing
- trust policy `sub` does not match repo/branch
- workflow missing `id-token: write`
- AWS region variable missing

Debug in workflow:

```yaml
- name: Verify AWS identity
  run: aws sts get-caller-identity
```

Expected result:

```text
Account: your AWS account
Arn: assumed role for GitHub Actions
```

## 11. Debugging S3 Uploads

Current upload command:

```bash
aws s3 sync dist/shell/browser s3://$AWS_SHELL_S3_BUCKET --delete
```

Use dry run first when debugging:

```bash
aws s3 sync dist/shell/browser s3://YOUR_BUCKET --delete --dryrun
```

Common failures:

### AccessDenied

Check IAM permissions:

```text
s3:ListBucket on bucket ARN
s3:PutObject on bucket/*
s3:DeleteObject on bucket/*
```

### Wrong build path

Check Angular output:

```bash
find dist -maxdepth 3 -type f
```

For this repo, shell output should be:

```text
dist/shell/browser
```

### Files upload but website is old

Likely CloudFront cache.

Check:

```bash
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

## 12. Debugging CloudFront

Common symptoms:

### CloudFront returns 403

Likely causes:

- S3 bucket policy does not allow CloudFront OAC
- CloudFront origin points to wrong S3 endpoint
- file does not exist in bucket
- default root object is missing

Check:

```text
CloudFront default root object = index.html
S3 has index.html
CloudFront origin uses the S3 bucket origin, not random website endpoint
OAC is attached to origin
bucket policy allows CloudFront distribution
```

### Direct S3 URL works but CloudFront fails

Usually CloudFront origin or OAC configuration.

### CloudFront works but old version is visible

Likely cache.

Check:

```text
Was invalidation created?
Did invalidation complete?
Is browser cache holding old files?
Is index.html cached too long?
```

### Deep link returns 403 or 404

Example:

```text
https://example.cloudfront.net/invoice
```

Angular SPA routes need CloudFront error response configuration:

```text
403 -> /index.html -> 200
404 -> /index.html -> 200
```

For microfrontends, be careful. Shell routes and remote routes may need separate behaviors later.

## 13. Cache Strategy

Good frontend cache model:

```text
index.html                 -> short cache
remote manifest files      -> short cache
hashed JS/CSS assets       -> long cache
images/assets with hash    -> long cache
```

Why:

```text
index.html points to the latest hashed files. If index.html is cached too long, users may not receive the newest deployment.
```

Basic learning setup can invalidate `/*`.

More mature setup:

```text
invalidate /index.html
invalidate /asset-manifest.json or remote manifest
let hashed files cache naturally
```

## 14. Microfrontend AWS Deployment Model

Phase 1:

```text
One workflow deploys shell only.
```

Phase 2:

```text
Add deploy-invoice workflow.
Add deploy-customers workflow.
```

Example future variables:

```text
AWS_SHELL_S3_BUCKET
AWS_INVOICE_S3_BUCKET
AWS_CUSTOMERS_S3_BUCKET
AWS_CLOUDFRONT_DISTRIBUTION_ID
```

CloudFront paths:

```text
/             -> shell bucket
/invoice/*    -> invoice bucket or prefix
/customers/*  -> customers bucket or prefix
```

Principal-level explanation:

```text
I would deploy shell and remotes independently, but keep CloudFront as the stable public entry point. That lets teams release independently while users see one coherent product URL.
```

## 15. Production Debugging Playbook

When production is broken, ask:

1. Is GitHub Actions green?
2. Did the correct Git SHA deploy?
3. Did files land in S3?
4. Is CloudFront serving the expected file?
5. Is invalidation complete?
6. Does the browser load JS chunks successfully?
7. Are remote entry or manifest URLs reachable?
8. Are API calls failing due to CORS/auth/backend?
9. Is the issue only one region/browser/user?
10. Can we roll back to previous artifact?

## 16. Browser Debugging

Use DevTools:

### Network tab

Look for:

```text
index.html status
main.*.js status
styles.*.css status
remote files status
API status
cache headers
```

### Console tab

Look for:

```text
chunk loading errors
CORS errors
auth errors
runtime exceptions
failed dynamic imports
```

### Application tab

Check:

```text
local storage
session storage
service workers
cache storage
```

If an old build keeps appearing, do a hard reload or clear site data.

## 17. Useful AWS CLI Commands

Check identity:

```bash
aws sts get-caller-identity
```

List bucket:

```bash
aws s3 ls s3://YOUR_BUCKET
```

Dry run sync:

```bash
aws s3 sync dist/shell/browser s3://YOUR_BUCKET --delete --dryrun
```

Upload:

```bash
aws s3 sync dist/shell/browser s3://YOUR_BUCKET --delete
```

Invalidate:

```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

Check invalidation:

```bash
aws cloudfront get-invalidation --distribution-id YOUR_DISTRIBUTION_ID --id YOUR_INVALIDATION_ID
```

## 18. Interview Talking Points

Strong answer:

```text
I treat frontend deployment as a supply chain. Source code moves through CI, deterministic build, artifact upload, CDN cache, and browser runtime. Debugging means isolating which boundary failed.
```

Strong answer:

```text
For AWS, I avoid public S3 buckets and long-lived GitHub secrets. I prefer CloudFront with Origin Access Control and GitHub OIDC into a least-privilege IAM role.
```

Strong answer:

```text
For microfrontends, I separate deployment units but keep operational controls centralized: logging, release tracking, cache policy, rollback, and ownership metadata.
```

## 19. Learning Plan

Use this sequence:

1. Fix production build locally.
2. Deploy shell only.
3. Debug IAM/OIDC until GitHub can assume AWS role.
4. Debug S3 upload until files land correctly.
5. Debug CloudFront until shell loads from CDN.
6. Add CloudFront SPA fallback.
7. Add invoice deployment.
8. Add customers deployment.
9. Add runtime federation.
10. Add API Gateway/Lambda/DynamoDB.
11. Add observability and rollback strategy.

## 20. References

- GitHub OIDC with AWS: https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws
- CloudFront Origin Access Control for S3: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- S3 static website hosting: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
- AWS CLI `s3 sync`: https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html
- CloudFront invalidations: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html
- GitHub Actions debug logging: https://docs.github.com/en/actions/how-tos/monitor-workflows/enable-debug-logging
