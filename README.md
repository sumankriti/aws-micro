# aws-micro

Angular learning repo for AWS deployments and future Angular microfrontends.

Repository target: [sumankriti/aws-micro](https://github.com/sumankriti/aws-micro)

The workspace contains a `shell` application and two remote applications: `invoice` and `customers`.

## Development server

To start the shell application, run:

```bash
npm run start:shell
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. If that port is busy, run `npx ng serve shell --port 4300`.

To start the remote apps, run each command in its own terminal:

```bash
npm run start:invoice
npm run start:customers
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the shell project run:

```bash
npm run build:shell
```

To build all microfrontend apps run:

```bash
npm run build:all
```

This will compile the selected project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## AWS + Microfrontend Learning

This repo includes a starter path for learning Angular microfrontends with AWS deployment:

- Principal engineer interview guide: [docs/principal-engineer-interview-guide.md](docs/principal-engineer-interview-guide.md)
- Step-by-step microfrontend guide: [docs/microfrontend-step-by-step.md](docs/microfrontend-step-by-step.md)
- Roadmap: [docs/aws-angular-microfrontend-roadmap.md](docs/aws-angular-microfrontend-roadmap.md)
- Local apps guide: [docs/local-microfrontend-apps.md](docs/local-microfrontend-apps.md)
- GitHub Actions starter workflow: [.github/workflows/deploy-angular-to-aws.yml](.github/workflows/deploy-angular-to-aws.yml)

The first milestone is deploying the shell app from GitHub Actions to S3 and CloudFront. After that, add independently deployed remote Angular apps behind the same CloudFront distribution.
