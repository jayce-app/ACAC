# Austin County Association of Contractors

Live site: **https://jayce-app.github.io/ACAC/**

## For the association owner (no coding)

Follow **[GO_LIVE.md](./GO_LIVE.md)** to connect:
- your registered DBA name
- a custom domain
- real shared member accounts (Supabase)

## Pages

- **Home** — Vision, About, Goals, public member list
- **Members** — Public directory of vetted members
- **Member login** — Apply / sign in; lounge unlocks after approval
- **Admin** — Approve applications and blacklist submissions
- **Permits** — County and city permit links, Texas 811
- **Education** — Curated calendar of third-party trade seminars (auto-refreshed)

## Developers

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key
npm run dev
npm run update:education   # refresh DWC + TACCA calendar listings
```

Without `.env`, the app uses a local browser demo mode so the UI still works.

A weekly GitHub Action (`.github/workflows/update-education-calendar.yml`) runs the same updater and opens a PR when listings change.
