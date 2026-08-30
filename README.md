# Ganbatte

Private PWA for JLPT N4/N5 learning — vocabulary, kanji, grammar, reading, and listening.

See [PLAN.md](./PLAN.md) for the full implementation specification.

## Setup

```bash
npm install
cp .env.example .env   # add your Supabase URL + publishable key
npm run dev
```

`vite.config.ts` sets `base: '/ganbatte/'` to match the GitHub Pages deployment path, which also applies to the dev server — open `http://localhost:5173/ganbatte/`, not the bare root.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

## Supabase migrations

Schema changes live in `supabase/migrations/`. Apply manually:

```bash
supabase db push
```

The AI agent does not run database migrations against production.

## Deployment

Deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

GitHub Pages has no server-side rewrites, so a path like `/topics/123` would 404 on a direct load or refresh. The app uses `HashRouter` (not `BrowserRouter`) specifically to work around this — routes are addressed as `/#/topics/123`, which Pages always resolves to `index.html`. If the app ever moves to a host with rewrite support (Vercel, Netlify, etc.), this can revert to `BrowserRouter`.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- React Router
- Supabase (Auth, Postgres, Storage)
- Dexie.js (offline IndexedDB — upcoming)
- vite-plugin-pwa
