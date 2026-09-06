import { nanoid } from '@reduxjs/toolkit';
import { buildSeed } from '../../data/seed';

// Zero-config fallback: everything in localStorage, one implicit local user.
// Mirrors the supabaseProvider interface so the rest of the app is agnostic.

const KEY = 'shelf-local-v1';
const LOCAL_USER = { id: 'local-user', email: 'you@local', display_name: 'You' };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function init() {
  let state = load();
  if (state) return state;

  const seed = buildSeed();
  const groupId = nanoid();
  state = {
    groups: [{ id: groupId, name: 'My Shelf', role: 'owner' }],
    members: { [groupId]: [{ id: LOCAL_USER.id, role: 'owner', name: 'You' }] },
    invites: {},
    entities: {
      [groupId]: {
        games: seed.games.map((g) => ({ ...g, groupId })),
        players: seed.players.map((p) => ({ ...p, groupId })),
        plays: seed.plays.map((p) => ({ ...p, groupId })),
        loans: seed.loans.map((l) => ({ ...l, groupId })),
        wishlist: seed.wishlist.map((w) => ({ ...w, groupId })),
      },
    },
  };
  save(state);
  return state;
}

let db = init();
const listeners = new Set();
const commit = () => {
  save(db);
  listeners.forEach((fn) => fn());
};

export const localProvider = {
  mode: 'local',

  async getSession() {
    return { user: LOCAL_USER };
  },
  onAuthChange() {
    return () => {};
  },
  async signIn() {
    throw new Error('Local mode has no accounts. Configure Supabase to sign in.');
  },
  async signUp() {
    throw new Error('Local mode has no accounts. Configure Supabase to sign up.');
  },
  async signOut() {},

  async listGroups() {
    return db.groups.map((g) => ({
      ...g,
      memberCount: (db.members[g.id] ?? []).length,
    }));
  },
  async createGroup(name) {
    const id = nanoid();
    db.groups.push({ id, name, role: 'owner' });
    db.members[id] = [{ id: LOCAL_USER.id, role: 'owner', name: 'You' }];
    db.entities[id] = { games: [], players: [], plays: [], loans: [], wishlist: [] };
    commit();
    return id;
  },
  async renameGroup(groupId, name) {
    const g = db.groups.find((x) => x.id === groupId);
    if (g) g.name = name;
    commit();
  },
  async leaveGroup(groupId) {
    db.groups = db.groups.filter((g) => g.id !== groupId);
    delete db.entities[groupId];
    delete db.members[groupId];
    commit();
  },
  async createInvite(groupId) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    db.invites[code] = groupId;
    commit();
    return code;
  },
  async joinGroup(code) {
    const groupId = db.invites[code.trim().toUpperCase()];
    if (!groupId) throw new Error('Invalid invite code (note: local codes only work on this device)');
    return groupId;
  },
  async removeMember(groupId, userId) {
    db.members[groupId] = (db.members[groupId] ?? []).filter((m) => m.id !== userId);
    commit();
  },
  async listMembers(groupId) {
    return db.members[groupId] ?? [];
  },

  async list(entity, groupId) {
    return [...(db.entities[groupId]?.[entity] ?? [])];
  },
  async create(entity, groupId, record) {
    const row = { ...record, id: record.id ?? nanoid(), groupId };
    db.entities[groupId][entity].push(row);
    commit();
    return row;
  },
  async update(entity, groupId, id, record) {
    const list = db.entities[groupId][entity];
    const i = list.findIndex((r) => r.id === id);
    if (i >= 0) list[i] = { ...list[i], ...record, id, groupId };
    commit();
    return list[i];
  },
  async remove(entity, groupId, id) {
    db.entities[groupId][entity] = db.entities[groupId][entity].filter((r) => r.id !== id);
    commit();
  },

  subscribe(_groupId, onChange) {
    const fn = () => onChange();
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // test/debug helper
  _reset() {
    localStorage.removeItem(KEY);
    db = init();
    commit();
  },
};
