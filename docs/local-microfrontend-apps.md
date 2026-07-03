# Local Microfrontend Apps

This workspace now has three Angular applications:

- `shell`: host application on port `4200`
- `invoice`: invoice remote application on port `4201`
- `customers`: customers remote application on port `4202`

Run each app in a separate terminal:

```bash
npm run start:shell
npm run start:invoice
npm run start:customers
```

Open:

- Shell: `http://localhost:4200`
- Invoice remote: `http://localhost:4201`
- Customers remote: `http://localhost:4202`

Current state:

- The apps are separate Angular applications in one workspace.
- They can be developed and served independently.
- The shell links to the local remote apps.
- Runtime federation is intentionally not added yet. Add native federation or module federation after all three apps build and run reliably.

Build commands:

```bash
npm run build:shared-core
npm run build:shell
npm run build:invoice
npm run build:customers
npm run build:all
```

The `shared-core` library contains shared cross-cutting services, including the example `LoggerService` used by both `invoice` and `customers`.
