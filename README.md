# TX Ropers Construction

Public website for TX Ropers Construction, LLC — Bellville, Texas.

## Pages

- **Home** — Brand hero, featured services, quote process
- **Services** — Residential and commercial service lists
- **Projects** — Photo gallery (`public/projects/` + `src/data/projects.ts`)
- **About** — Mission, credentials, service area, hours
- **Contact** — Office phone/email and quote request form

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

1. **New → Static Site** (or **New → Blueprint** to use `render.yaml`)
2. Connect **`jayce-app/ACAC`**
3. Branch: **`cursor/tx-ropers-website-9034`** (do not use `main` — that is the ACAC site)
4. Build command: `npm ci && npm run build`
5. Publish directory: `dist`
6. Add a rewrite: source `/*` → destination `/index.html`

Render will give you an `onrender.com` URL. After that you can attach **www.txropersconstruction.com** under Settings → Custom Domains.

## Brand assets

Put your real logo at **`public/logo.jpg`**. Header and footer use that file only.

- `public/logo.jpg` — your official logo (JPG is fine)
- `public/hero.jpg` — home hero photo
