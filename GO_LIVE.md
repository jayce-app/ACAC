# Go live checklist (no coding)

Your site is already online: **https://jayce-app.github.io/ACAC/**

This checklist turns it into a real association website with shared member accounts and your DBA domain.

---

## A. Tell Cursor these 4 things (reply in chat)

1. **Exact DBA name** (as registered)
2. **Domain name** you own or want (example: `austincountycontractors.org`)
3. **Admin email** you will use to run the site (your real email)
4. After step B below, paste:
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
- Review blacklist wording with an attorney
- Add Terms of Use + Privacy Policy when ready

---

## What changes after Supabase is connected

| Before | After |
| --- | --- |
| Data lives in each browser | Shared cloud database |
| Demo admin `board@acac.local` | Your real admin email |
| github.io URL | Your domain (optional) |
