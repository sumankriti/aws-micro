# shared-core

Shared Angular source library for cross-cutting services used by the microfrontend apps.

Current shared service:

- `LoggerService`

Import from any app:

```ts
import { LoggerService } from 'shared-core';
```

Use this library for platform-style services that are stable across remotes:

- logging
- telemetry
- auth context
- feature flags
- API configuration

Avoid placing domain-specific services here. For example, invoice save logic belongs in the invoice remote, and customer search logic belongs in the customers remote.

The local workspace maps `shared-core` to `projects/shared-core/src/public-api.ts` in the root `tsconfig.json`, so apps consume the source directly during development.
