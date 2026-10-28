# TX Ropers Construction

Public website for TX Ropers Construction, LLC — Bellville, Texas.

## Pages

- **Home** — Brand hero, featured services, quote process
- **Services** — Residential and commercial service lists
- **Projects** — Photo gallery (`public/projects/` + `src/data/projects.ts`)
- **About** — Mission, credentials, service area, hours
- **Contact** — Office phone/email and quote request form
- **Employee console** — `/employee` clock in/out, time logs, SOPs/announcements

## Employee console

Private crew area at **`/employee`**.

Features:
- Clock in/out with **required GPS** (punch blocked until location works)
- **Required notifications** for punch reminders (punch blocked until allowed)
- **Geofences** (admin sets circular jobsite/shop fences; crew get clock-in/out alerts on enter/exit while the console is open)
- Personal + admin time logs (map links)
- Reminders: clock in / clock out / long-shift
- Internal documents (SOPs, announcements)
- **Installable phone shell** via PWA (`manifest.webmanifest` + service worker) — native store app can wrap the same APIs later for true background geofencing

### Local demo (no Supabase yet)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@txropersconstruction.com` | `ropers2026` |
| Crew | `crew@txropersconstruction.com` | `crew2026` |

### Install on a phone (PWA)

1. Open `/employee` in Safari (iPhone) or Chrome (Android)
2. Share / menu → **Add to Home Screen**
3. Allow notifications when prompted on the Time clock page

### Production (Supabase)

1. Create a **new** Supabase project (do not reuse ACAC)
2. Run `supabase/employee-schema.sql` in the SQL editor
3. Create Auth users for the crew (Dashboard → Authentication)
4. Promote yourself:  
   `update public.employees set role = 'admin' where email = 'you@…';`
5. Set Render env vars from `.env.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Adding project photos

1. Drop images into `public/projects/`
2. Register each photo in `src/data/projects.ts`
3. See `public/projects/README.md` for details

## Contact (as shown on site)

- Office: 979-353-1292
- Email: sales@txropersconstruction.com
- Address: 3016 Newsom Rd, Bellville, TX 77418
- Hours: Monday–Friday, 8:00 a.m.–5:00 p.m.

## Deploy on Render

This is a static Vite site. On [Render](https://dashboard.render.com):

1. **New → Static Site** (not a Web Service)
2. Connect **`jayce-app/ACAC`**
3. Use these exact fields:

   | Field | Value |
   |---|---|
   | Branch | `cursor/tx-ropers-website-9034` |
   | Build Command | `npm run build` |
   | Publish Directory | `dist` |
   | NODE_VERSION (env) | `22` |

   Do not put the build command in Publish Directory. Do not use branch `main` (that is the ACAC site).

4. Add a rewrite: source `/*` → destination `/index.html`

Render will give you an `onrender.com` URL. After that you can attach **www.txropersconstruction.com** under Settings → Custom Domains.

## Brand assets

Put your real logo at **`public/logo.jpg`**. Header and footer use that file only.

- `public/logo.jpg` — your official logo (JPG is fine)
- `public/hero.jpg` — home hero photo
