import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectPlayers, selectPlays } from '../lib/selectors';
import { addPlayer, editPlayer, removePlayer } from '../features/players/playersSlice';
import {
  selectGroups, selectActiveGroup, selectActiveGroupId,
  activeGroupSet, createGroup, joinGroup, renameGroup, leaveGroup, createInvite, fetchGroups,
} from '../features/groups/groupsSlice';
import { selectUser, signOut, deleteAccount } from '../features/auth/authSlice';
import { provider, isCloud } from '../lib/db';
import { localProvider } from '../lib/db/localProvider';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const players = useAppSelector(selectPlayers);
  const plays = useAppSelector(selectPlays);
  const groups = useAppSelector(selectGroups);
  const group = useAppSelector(selectActiveGroup);
  const groupId = useAppSelector(selectActiveGroupId);
  const user = useAppSelector(selectUser);
  const isOwner = group?.role === 'owner';

  const [members, setMembers] = useState([]);
  const [invite, setInvite] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [msg, setMsg] = useState('');

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };
  const playCount = (id) => plays.filter((p) => p.playerIds.includes(id)).length;

  const loadMembers = useCallback(() => {
    if (groupId) provider.listMembers(groupId).then(setMembers).catch(() => setMembers([]));
  }, [groupId]);

  useEffect(() => { setInvite(''); loadMembers(); }, [loadMembers]);

  const kickMember = async (m) => {
    if (!confirm(`Remove ${m.name} from ${group.name}? Their access to this group's shelf ends.`)) return;
    await provider.removeMember(groupId, m.id);
    loadMembers();
    dispatch(fetchGroups());
    flash(`Removed ${m.name}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>
      {msg && <p className="text-sm text-emerald-300">{msg}</p>}

      {/* ---- Account (or local data) ---- */}
      {isCloud && user && (
        <section className="card space-y-3">
          <h2 className="font-semibold">Account</h2>
          <p className="text-sm text-slate-400">
            {user.username ? `@${user.username} · ` : ''}{user.email}
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => dispatch(signOut())}>Sign out</button>
            <button
              className="btn-ghost text-rose-300"
              onClick={async () => {
                const owned = groups.filter((g) => g.role === 'owner');
                const shared = owned.filter((g) => g.memberCount > 1).map((g) => g.name);
                const warning = shared.length
                  ? `\n\nOwnership of ${shared.join(', ')} will pass to the longest-standing member. Groups where you're the only member will be deleted with all their data.`
                  : '\n\nYour groups and all their data will be deleted.';
                if (!confirm(`Permanently delete your account?${warning}\n\nThis cannot be undone.`)) return;
                try {
                  await dispatch(deleteAccount()).unwrap();
                  window.location.reload();
                } catch (err) {
                  flash(err.message || 'Could not delete account');
                }
              }}
            >
              Delete account
            </button>
          </div>
        </section>
      )}
      {!isCloud && (
        <section className="card space-y-2">
          <h2 className="font-semibold">Local data</h2>
          <p className="text-sm text-slate-400">Everything is stored in this browser. No account, nothing sent anywhere.</p>
          <button
            className="btn-ghost text-rose-300"
            onClick={() => {
              if (confirm('Erase all local data and reload with fresh seed data?')) {
                localProvider._reset();
                window.location.reload();
              }
            }}
          >
            Reset local data
          </button>
        </section>
      )}

      {/* ---- Your groups: switch / create / join ---- */}
      <section className="card space-y-3">
        <h2 className="font-semibold">Your groups</h2>
        <ul className="space-y-1 text-sm">
          {groups.map((g) => (
            <li key={g.id} className="flex items-center justify-between">
              <button
                className={`text-left ${g.id === groupId ? 'font-semibold text-brand' : 'text-slate-200'}`}
                onClick={() => dispatch(activeGroupSet(g.id))}
              >
                {g.name}
              </button>
              <span className="text-xs text-slate-500">
                {g.role}{g.memberCount > 1 ? ` · ${g.memberCount} members` : ''}
              </span>
            </li>
          ))}
        </ul>
        <div className="grid gap-3 border-t border-edge pt-3 sm:grid-cols-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newGroup.trim()) { dispatch(createGroup(newGroup.trim())); setNewGroup(''); flash('Group created'); }
            }}
            className="flex gap-2"
          >
            <input className="field" placeholder="New group name" value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)} />
            <button className="btn-ghost shrink-0">Create</button>
          </form>
          {isCloud && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!joinCode.trim()) return;
                const res = await dispatch(joinGroup(joinCode.trim()));
                if (res.error) flash(res.error.message);
                else { flash('Joined group'); setJoinCode(''); }
              }}
              className="flex gap-2"
            >
              <input className="field" placeholder="Invite code" value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)} />
              <button className="btn-ghost shrink-0">Join</button>
            </form>
          )}
        </div>
      </section>

      {/* ---- Group settings + players (one card, not visually separated) ---- */}
      <section className="card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Group settings</h2>
          {groups.length > 1 ? (
            <select
              className="field w-auto py-1.5 text-sm"
              value={groupId ?? ''}
              onChange={(e) => dispatch(activeGroupSet(e.target.value))}
              aria-label="Group to manage"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          ) : (
            <span className="chip">{group?.name ?? 'My Shelf'}</span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          {isCloud
            ? "Everyone in this group shares its shelf, plays, lending and wishlist. You're viewing and editing this group everywhere in the app."
            : 'Local mode: groups live only on this device. Configure Supabase to share a group across devices.'}
        </p>

        {group && (
          <div>
            <label className="label">Group name</label>
            <input
              className="field" defaultValue={group.name} key={group.id} disabled={!isOwner}
              onBlur={(e) => {
                const name = e.target.value.trim();
                if (name && name !== group.name) {
                  dispatch(renameGroup({ groupId, name })).then(() => flash('Group renamed'));
                }
              }}
            />
            {!isOwner && <p className="mt-1 text-xs text-slate-500">Only the group owner can rename it.</p>}
          </div>
        )}

        {/* ---- User management for this group ---- */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Members ({members.length})
            </span>
            {isOwner && isCloud && (
              <button
                className="text-xs text-brand"
                onClick={async () => {
                  const code = await dispatch(createInvite(groupId)).unwrap();
                  setInvite(code);
                }}
              >
                + Invite someone
              </button>
            )}
          </div>

          {invite && (
            <p className="mb-2 rounded-xl border border-edge bg-canvas p-3 text-sm">
              Invite code: <span className="font-mono font-bold text-brand">{invite}</span>
              <span className="text-slate-400"> — share it; expires in 7 days.</span>
            </p>
          )}

          <ul className="divide-y divide-edge text-sm">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2">
                <span>
                  {m.name}
                  {m.id === user?.id && <span className="text-slate-500"> (you)</span>}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{m.role}</span>
                  {isOwner && m.id !== user?.id && (
                    <button className="text-xs text-rose-300" onClick={() => kickMember(m)}>
                      Remove
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {groups.length > 1 && (
          <button
            className="btn-ghost text-rose-300"
            onClick={async () => {
              if (!confirm(`Leave ${group.name}?`)) return;
              await dispatch(leaveGroup(groupId));
              flash('Left group');
            }}
          >
            Leave this group
          </button>
        )}

        {/* players in this group — same card, no visual separation */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">Players in {group?.name ?? 'this group'}</h3>
            <p className="text-xs text-slate-400">Nicknames used when logging plays. Separate from group members.</p>
          </div>
          <ul className="space-y-2">
            {players.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <input
                  className="field" defaultValue={p.name} key={p.id}
                  onBlur={(e) => {
                    const name = e.target.value.trim();
                    if (name && name !== p.name) {
                      dispatch(editPlayer({ groupId, id: p.id, changes: { name } }));
                    }
                  }}
                />
                <span className="shrink-0 text-xs text-slate-500">{playCount(p.id)} plays</span>
                <button className="text-xs text-rose-300" onClick={() => dispatch(removePlayer({ groupId, id: p.id }))}>✕</button>
              </li>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (playerName.trim()) { dispatch(addPlayer({ groupId, input: { name: playerName.trim() } })); setPlayerName(''); }
            }}
            className="flex gap-2"
          >
            <input className="field" placeholder="New player name" value={playerName}
              onChange={(e) => setPlayerName(e.target.value)} />
            <button className="btn-ghost shrink-0">Add</button>
          </form>
        </div>
      </section>
    </div>
  );
}
