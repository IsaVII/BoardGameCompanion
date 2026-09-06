-- Allow signing in with a username as well as an email.
-- Usernames are stored on profiles (case-insensitive, unique); login resolves a
-- username to its email via a SECURITY DEFINER RPC, then Supabase Auth handles
-- the rest with email + password as before.

create extension if not exists citext;

alter table public.profiles
  add column if not exists username citext unique;

-- Backfill existing rows from the email local-part, de-duplicating with a suffix.
do $$
declare r record; base text; candidate text; n int;
begin
  for r in
    select p.id, u.email
    from public.profiles p join auth.users u on u.id = p.id
    where p.username is null
  loop
    base := regexp_replace(split_part(r.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g');
    if base = '' then base := 'user'; end if;
    candidate := base;
    n := 0;
    while exists (select 1 from public.profiles where username = candidate) loop
      n := n + 1;
      candidate := base || n::text;
    end loop;
    update public.profiles set username = candidate where id = r.id;
  end loop;
end $$;

-- Recreate the signup handler to also persist a username.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  gid uuid;
  uname citext;
begin
  uname := nullif(trim(new.raw_user_meta_data->>'username'), '');
  if uname is null then
    uname := regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g');
  end if;
  if exists (select 1 from public.profiles where username = uname) then
    uname := uname || floor(random() * 10000)::text;
  end if;

  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', uname::text),
    uname
  );

  insert into public.groups (name, created_by) values ('My Shelf', new.id)
  returning id into gid;

  insert into public.group_members (group_id, user_id, role) values (gid, new.id, 'owner');
  return new;
end $$;

-- Username -> email lookup for login. Runs as definer so the anon role can call
-- it without read access to auth.users or other people's profiles.
create or replace function public.email_for_username(uname text)
returns text language sql security definer stable
set search_path = public as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.username = uname::citext
  limit 1;
$$;

revoke all on function public.email_for_username(text) from public;
grant execute on function public.email_for_username(text) to anon, authenticated;
