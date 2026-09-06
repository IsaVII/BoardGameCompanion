-- Account deletion.
--
-- Deleting a user must not leave dangling references. For every group the user
-- owns: hand ownership to the longest-standing remaining member, or delete the
-- group outright if they were the only member. Everything else is handled by
-- relaxing the `created_by` foreign keys to ON DELETE SET NULL so historical
-- rows (games, plays, ...) survive with an anonymised author.

-- 1. created_by references -> ON DELETE SET NULL ------------------------------

alter table public.groups        alter column created_by drop not null;

alter table public.groups        drop constraint if exists groups_created_by_fkey;
alter table public.groups        add  constraint groups_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

alter table public.group_invites drop constraint if exists group_invites_created_by_fkey;
alter table public.group_invites add  constraint group_invites_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

do $$
declare t text;
begin
  foreach t in array array['games', 'players', 'plays', 'loans', 'wishlist']
  loop
    execute format('alter table public.%I drop constraint if exists %I', t, t || '_created_by_fkey');
    execute format(
      'alter table public.%I add constraint %I foreign key (created_by) references auth.users(id) on delete set null',
      t, t || '_created_by_fkey');
  end loop;
end $$;

-- 2. delete_my_account() ----------------------------------------------------

create or replace function public.delete_my_account()
returns void language plpgsql security definer
set search_path = public, auth as $$
declare
  v_uid  uuid := auth.uid();
  v_grp  uuid;
  v_heir uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  for v_grp in
    select group_id from public.group_members
    where user_id = v_uid and role = 'owner'
  loop
    select user_id into v_heir
    from public.group_members
    where group_id = v_grp and user_id <> v_uid
    order by joined_at asc, user_id asc
    limit 1;

    if v_heir is null then
      delete from public.groups where id = v_grp;      -- cascades members + all group data
    else
      update public.group_members set role = 'owner'
        where group_id = v_grp and user_id = v_heir;
      update public.groups set created_by = v_heir where id = v_grp;
    end if;
  end loop;

  -- Cascades: profiles, remaining group_members, auth.identities/sessions.
  -- SET NULL: created_by on groups / invites / domain rows in other groups.
  delete from auth.users where id = v_uid;
end $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
