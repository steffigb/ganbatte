# Ganbatte

Private PWA for JLPT N4/N5 learning — vocabulary, kanji, grammar, reading, and listening.

See [PLAN.md](./PLAN.md) for the full implementation specification.

## Setup

```bash
npm install
cp .env.example .env   # add your Supabase URL + publishable key
npm run dev
```

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

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- React Router
- Supabase (Auth, Postgres, Storage)
- Dexie.js (offline IndexedDB — upcoming)
- vite-plugin-pwa
