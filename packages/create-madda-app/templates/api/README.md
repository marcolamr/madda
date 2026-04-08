# {{APP_DISPLAY_NAME}}

Scaffolded with **create-madda-app** (Madda — Fastify + Laravel-style conventions).

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | HTTP server (tsx watch) |
| `pnpm madda` | Console (`list`, `help`, `key:generate`, …) |
| `pnpm lint` | ESLint |

From the **monorepo root**, run `pnpm install` if you have not already, then work inside this app directory.

## Layout

- `routes/web.ts` — HTTP routes
- `routes/console.ts` — `Madda.command` registrations
