# Supabase setup

The app runs in **local mode** (localStorage, single device) with no config.
To enable accounts and shared groups across devices, point it at a Supabase project.

## 1. Create a project

<https://supabase.com/dashboard> → New project. Note the **Project URL** and the
**anon public** API key (Project Settings → API).

## 2. Apply the schema

Either paste [`migrations/0001_init.sql`](migrations/0001_init.sql) into the SQL
editor and run it, or with the CLI:

```bash
supabase link --project-ref <ref>
supabase db push
```

## 3. Auth settings

Auth → Providers → Email: enable. For quick local testing, turn **off**
"Confirm email" so signups are usable immediately.

## 4. Point the client at it

```bash
cd client
cp .env.example .env.local
# fill in:
#   VITE_SUPABASE_URL=https://<ref>.supabase.co
#   VITE_SUPABASE_ANON_KEY=<anon key>
npm run dev
```

When those vars are present the app switches to Supabase mode: login screen,
group switcher, and realtime sync. Remove them to go back to local mode.

## Data model

`groups` own everything. `group_members` links users to groups with a role.
Domain tables (`games`, `players`, `plays`, `loans`, `wishlist`) are
`{ id, group_id, data jsonb, created_by, timestamps }`. RLS lets a user read or
write a row only when they are a member of its group. New signups get a personal
"My Shelf" group via a trigger; `join_group_with_code()` adds them to others.
