# {{APP_DISPLAY_NAME}}

Scaffolded with **create-madda-app** — Madda API + **@madda/play-web** (Vite + React Router SSR, Next.js–style data loaders).

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | HTTP + Vite middleware & SSR (tsx watch) |
| `pnpm madda` | Console (`migrate`, `key:generate`, …) |
| `pnpm madda migrate` | Run SQLite migrations |
| `pnpm lint` | ESLint |

From the **monorepo root**, run `pnpm install` if you have not already, then work inside this app directory.

## Layout

- `routes/web.ts` — HTTP routes
- `routes/console.ts` — `Madda.command` registrations
