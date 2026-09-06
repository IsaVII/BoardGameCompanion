-- Shelf — schema, row-level security, and signup automation.
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.group_invites (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  code       text not null unique,
  created_by uuid not null references auth.users(id) default auth.uid(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Domain tables share a shape: scoping columns + a jsonb payload for the rest.
-- The client works with a flattened `{ id, ...data }` record.
do $$
declare t text;
begin
  foreach t in array array['games', 'players', 'plays', 'loans', 'wishlist']
  loop
    execute format($f$
      create table if not exists public.%I (
        id         uuid primary key default gen_random_uuid(),
        group_id   uuid not null references public.groups(id) on delete cascade,
        data       jsonb not null default '{}'::jsonb,
        created_by uuid references auth.users(id) default auth.uid(),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
      create index if not exists %I on public.%I (group_id);
    $f$, t, t || '_group_idx', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_group_member(gid uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

create or replace function public.is_group_owner(gid uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- New user -> profile + personal group + owner membership.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
declare gid uuid;
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));

  insert into public.groups (name, created_by) values ('My Shelf', new.id)
  returning id into gid;

  insert into public.group_members (group_id, user_id, role) values (gid, new.id, 'owner');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create a group and its owner membership atomically. Done as an RPC because,
-- mid-transaction, the caller is not yet a member and the groups SELECT policy
-- would otherwise hide the row from the INSERT ... RETURNING.
create or replace function public.create_group(group_name text)
returns uuid language plpgsql security definer
set search_path = public as $$
declare gid uuid;
begin
  insert into public.groups (name, created_by) values (group_name, auth.uid())
  returning id into gid;
  insert into public.group_members (group_id, user_id, role)
  values (gid, auth.uid(), 'owner');
  return gid;
end $$;

-- Join a group by invite code (bypasses RLS on group_invites by design).
create or replace function public.join_group_with_code(invite_code text)
returns uuid language plpgsql security definer
set search_path = public as $$
declare v_group uuid;
begin
  select group_id into v_group
  from public.group_invites
  where code = invite_code and (expires_at is null or expires_at > now());

  if v_group is null then
    raise exception 'Invalid or expired invite code';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (v_group, auth.uid(), 'member')
  on conflict do nothing;

  return v_group;
end $$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.groups         enable row level security;
alter table public.group_members  enable row level security;
alter table public.group_invites  enable row level security;

create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);
create policy "own profile is editable"
  on public.profiles for update to authenticated using (id = auth.uid());

create policy "see groups you belong to"
  on public.groups for select to authenticated using (public.is_group_member(id));
create policy "create your own group"
  on public.groups for insert to authenticated with check (created_by = auth.uid());
create policy "owners rename/delete group"
  on public.groups for update to authenticated using (public.is_group_owner(id));
create policy "owners delete group"
  on public.groups for delete to authenticated using (public.is_group_owner(id));

create policy "see co-members"
  on public.group_members for select to authenticated using (public.is_group_member(group_id));
create policy "leave a group"
  on public.group_members for delete to authenticated
  using (user_id = auth.uid() or public.is_group_owner(group_id));

create policy "members see invites"
  on public.group_invites for select to authenticated using (public.is_group_member(group_id));
create policy "members create invites"
  on public.group_invites for insert to authenticated with check (public.is_group_member(group_id));
create policy "members revoke invites"
  on public.group_invites for delete to authenticated using (public.is_group_member(group_id));

do $$
declare t text;
begin
  foreach t in array array['games', 'players', 'plays', 'loans', 'wishlist']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy "members read %1$s"   on public.%1$I for select to authenticated using (public.is_group_member(group_id));
      create policy "members insert %1$s" on public.%1$I for insert to authenticated with check (public.is_group_member(group_id));
      create policy "members update %1$s" on public.%1$I for update to authenticated using (public.is_group_member(group_id));
      create policy "members delete %1$s" on public.%1$I for delete to authenticated using (public.is_group_member(group_id));
    $p$, t);
    execute format('create trigger touch_%1$s before update on public.%1$I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Optional: live updates across devices.
do $$
declare t text;
begin
  foreach t in array array['games', 'players', 'plays', 'loans', 'wishlist', 'group_members']
  loop
    execute format('alter publication supabase_realtime add table public.%I', t);
  end loop;
exception when duplicate_object then null;
end $$;
