# aws-micro

Angular learning repo for AWS deployments and future Angular microfrontends.

Repository target: [sumankriti/aws-micro](https://github.com/sumankriti/aws-micro)

The current Angular app should be treated as the future `shell` application. The next apps can be added as independently deployed remotes, for example `invoice` and `customers`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

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

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

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
