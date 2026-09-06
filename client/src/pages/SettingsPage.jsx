import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectPlayers, selectPlays } from '../lib/selectors';
import { addPlayer, editPlayer, removePlayer } from '../features/players/playersSlice';
import {
  selectGroups, selectActiveGroup, selectActiveGroupId,
  createGroup, joinGroup, renameGroup, leaveGroup, createInvite,
} from '../features/groups/groupsSlice';
import { selectUser, signOut } from '../features/auth/authSlice';
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

  const [name, setName] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [invite, setInvite] = useState('');
  const [members, setMembers] = useState([]);
  const [msg, setMsg] = useState('');

  const playCount = (id) => plays.filter((p) => p.playerIds.includes(id)).length;

  useEffect(() => {
    if (groupId) provider.listMembers(groupId).then(setMembers).catch(() => setMembers([]));
  }, [groupId, groups]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>
      {msg && <p className="text-sm text-emerald-300">{msg}</p>}

      {isCloud && user && (
        <section className="card space-y-2">
          <h2 className="font-semibold">Account</h2>
          <p className="text-sm text-slate-400">{user.displayName} · {user.email}</p>
          <button className="btn-ghost" onClick={() => dispatch(signOut())}>Sign out</button>
        </section>
      )}

      <section className="card space-y-4">
        <div>
          <h2 className="font-semibold">Group: {group?.name ?? '—'}</h2>
          <p className="text-xs text-slate-400">
            {isCloud
              ? 'Everyone in a group shares its shelf, plays, lending and wishlist.'
              : 'Local mode: groups live only on this device. Configure Supabase to share across devices.'}
          </p>
        </div>

        {group && (
          <div className="flex gap-2">
            <input
              className="field" defaultValue={group.name}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== group.name) {
                  dispatch(renameGroup({ groupId, name: e.target.value.trim() }));
                }
              }}
            />
            {group.role === 'owner' && (
              <button
                className="btn-ghost shrink-0"
                onClick={async () => {
                  const code = await dispatch(createInvite(groupId)).unwrap();
                  setInvite(code);
                }}
              >
                Invite
              </button>
            )}
          </div>
        )}

        {invite && (
          <p className="rounded-xl border border-edge bg-canvas p-3 text-sm">
            Invite code: <span className="font-mono font-bold text-brand">{invite}</span>
            <span className="text-slate-400"> — share it; expires in 7 days.</span>
          </p>
        )}

        <div>
          <p className="label">Members</p>
          <ul className="space-y-1 text-sm">
            {members.map((m) => (
              <li key={m.id} className="flex justify-between">
                <span>{m.name}</span><span className="text-slate-500">{m.role}</span>
              </li>
            ))}
          </ul>
        </div>

        {groups.length > 1 && (
          <button
            className="btn-ghost text-rose-300"
            onClick={() => dispatch(leaveGroup(groupId))}
          >
            Leave this group
          </button>
        )}

        <div className="grid gap-3 border-t border-edge pt-4 sm:grid-cols-2">
          <form
            onSubmit={(e) => { e.preventDefault(); if (newGroup.trim()) { dispatch(createGroup(newGroup.trim())); setNewGroup(''); } }}
            className="flex gap-2"
          >
            <input className="field" placeholder="New group name" value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)} />
            <button className="btn-ghost shrink-0">Create</button>
          </form>
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
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Players</h2>
        <p className="text-xs text-slate-400">Nicknames used when logging plays in this group.</p>
        <ul className="space-y-2">
          {players.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <input
                className="field" defaultValue={p.name}
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value !== p.name) {
                    dispatch(editPlayer({ groupId, id: p.id, changes: { name: e.target.value.trim() } }));
                  }
                }}
              />
              <span className="shrink-0 text-xs text-slate-500">{playCount(p.id)} plays</span>
              <button className="text-xs text-rose-300" onClick={() => dispatch(removePlayer({ groupId, id: p.id }))}>✕</button>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => { e.preventDefault(); if (name.trim()) { dispatch(addPlayer({ groupId, input: { name: name.trim() } })); setName(''); } }}
          className="flex gap-2"
        >
          <input className="field" placeholder="New player name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn-ghost shrink-0">Add</button>
        </form>
      </section>

      {!isCloud && (
        <section className="card space-y-2">
          <h2 className="font-semibold">Local data</h2>
          <p className="text-sm text-slate-400">
            Everything is stored in this browser. No account, nothing sent anywhere.
          </p>
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
    </div>
  );
}
