# Go live checklist (no coding)

Your site is already online: **https://jayce-app.github.io/ACAC/**

This checklist turns it into a real association website with shared member accounts and your DBA domain.

**DBA:** Austin County Association of Contractors  
**Domain:** still pending — leave blank until secured  
**Deploy branch for Render:** `cursor/acac-website-2453` (auto-deploys on push)

---

## Render auto-deploy (recommended)

Once the service exists in Render, updates deploy themselves when this branch is pushed.

1. In [Render](https://dashboard.render.com), create a **Static Site** (or Blueprint from `render.yaml`)
2. Connect GitHub repo **jayce-app/ACAC**
3. Branch: **`cursor/acac-website-2453`**
4. Turn **Auto-Deploy** on (Blueprint sets `autoDeployTrigger: commit`)
5. Build command: `npm ci && npm run build`
6. Publish directory: `dist`

Optional backup: in the Render service → **Settings → Deploy Hook**, copy the URL, then in GitHub → **Settings → Secrets → Actions**, add secret `RENDER_DEPLOY_HOOK`. The workflow `.github/workflows/deploy-render.yml` will ping it on every push.

---

## A. Tell Cursor these things when ready

1. **Domain name** once you own it (example: `austincountycontractors.org`)
2. **Admin email** you will use to run the site
3. After step B below, paste:
   - **Project URL**
   - **anon public key**

---

## B. Create the member database (about 10 minutes)

1. Open [https://supabase.com](https://supabase.com) and create a free account
2. Click **New project**
   - Name: `ACAC`
   - Set a strong database password (save it)
   - Region: closest to Texas (often `East US`)
3. Wait until the project is ready
4. Left sidebar → **SQL** → **New query**
5. Open the file `supabase/schema.sql` in your GitHub repo, copy all of it, paste into Supabase, click **Run**
6. Left sidebar → **Project Settings** → **API**
7. Copy:
   - **Project URL**
   - **anon public** key  
   Reply with those in Cursor chat (not the `service_role` key)

---

## C. Make yourself admin

1. On the live site, open **Member login** → **Application**
2. Apply with your **admin email** and a password
3. In Supabase → **SQL** → New query, run (edit the email):

```sql
update public.profiles
set role = 'admin', status = 'approved'
where email = 'you@yourdomain.com';
```

4. Sign in on the site with that email — you should see **Admin**

---

## D. Connect your custom domain

1. Buy the domain (GoDaddy, Namecheap, Cloudflare, Google Domains, etc.)
2. Reply in Cursor with the domain — we will add the `CNAME` file and Pages settings
3. In your domain registrar DNS, add what we send you (usually a `CNAME` pointing to `jayce-app.github.io`)
4. GitHub → repo **Settings → Pages → Custom domain** → enter your domain → Save
5. Wait for HTTPS to show a checkmark (can take up to an hour)

---

## E. Business basics (you / your attorney)

- Put a real contact email on the site
- Review **Terms** (`/terms`) and **Privacy** (`/privacy`) with a Texas attorney — drafts are live
- Especially review anonymous-forum rules for defamation and privacy risk
- Customize those pages with your exact DBA name and support email

---

## What changes after Supabase is connected

| Before | After |
| --- | --- |
| Data lives in each browser | Shared cloud database |
| Demo admin `board@acac.local` | Your real admin email |
| github.io URL | Your domain (optional) |
