import { supabase } from '../supabase';

// Domain rows are stored as { id, group_id, data: {...} }. The rest of the app
// works with a flat record, so split/merge here.
const flatten = (row) => ({ id: row.id, groupId: row.group_id, ...row.data });
const toData = ({ id, groupId, ...rest }) => rest;

const ENTITY_TABLE = {
  games: 'games',
  players: 'players',
  plays: 'plays',
  loans: 'loans',
  wishlist: 'wishlist',
};

export const supabaseProvider = {
  mode: 'cloud',

  // ---- auth -------------------------------------------------------------
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  onAuthChange(cb) {
    const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session));
    return () => data.subscription.unsubscribe();
  },
  // `identifier` is an email or a username.
  async signIn(identifier, password) {
    let email = identifier.trim();
    if (!email.includes('@')) {
      const { data, error } = await supabase.rpc('email_for_username', { uname: email });
      if (error) throw error;
      if (!data) throw new Error('No account found with that username');
      email = data;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async signUp(email, password, username) {
    const uname = username.trim().toLowerCase();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: uname, display_name: username.trim() } },
    });
    if (error) throw error;
  },
  async signOut() {
    await supabase.auth.signOut();
  },

  // ---- groups ---------------------------------------------------------
  async listGroups() {
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, created_by, group_members(user_id, role)')
      .order('created_at', { ascending: true });
    if (error) throw error;
    const { data: me } = await supabase.auth.getUser();
    return data.map((g) => ({
      id: g.id,
      name: g.name,
      role: g.group_members.find((m) => m.user_id === me.user?.id)?.role ?? 'member',
      memberCount: g.group_members.length,
    }));
  },
  async createGroup(name) {
    const { data, error } = await supabase.rpc('create_group', { group_name: name });
    if (error) throw error;
    return data;
  },
  async renameGroup(groupId, name) {
    const { error } = await supabase.from('groups').update({ name }).eq('id', groupId);
    if (error) throw error;
  },
  async leaveGroup(groupId) {
    const { data: me } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', me.user.id);
    if (error) throw error;
  },
  async createInvite(groupId) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const expires = new Date(Date.now() + 7 * 86400000).toISOString();
    const { error } = await supabase
      .from('group_invites')
      .insert({ group_id: groupId, code, expires_at: expires });
    if (error) throw error;
    return code;
  },
  async joinGroup(code) {
    const { data, error } = await supabase.rpc('join_group_with_code', {
      invite_code: code.trim().toUpperCase(),
    });
    if (error) throw error;
    return data;
  },
  async removeMember(groupId, userId) {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    if (error) throw error;
  },
  async listMembers(groupId) {
    const { data, error } = await supabase
      .from('group_members')
      .select('user_id, role, profiles(display_name)')
      .eq('group_id', groupId);
    if (error) throw error;
    return data.map((m) => ({ id: m.user_id, role: m.role, name: m.profiles?.display_name ?? '?' }));
  },

  // ---- domain entities ----------------------------------------------
  async list(entity, groupId) {
    const { data, error } = await supabase
      .from(ENTITY_TABLE[entity])
      .select('id, group_id, data')
      .eq('group_id', groupId);
    if (error) throw error;
    return data.map(flatten);
  },
  async create(entity, groupId, record) {
    const { data, error } = await supabase
      .from(ENTITY_TABLE[entity])
      .insert({ group_id: groupId, data: toData(record) })
      .select('id, group_id, data')
      .single();
    if (error) throw error;
    return flatten(data);
  },
  async update(entity, groupId, id, record) {
    const { data, error } = await supabase
      .from(ENTITY_TABLE[entity])
      .update({ data: toData(record) })
      .eq('id', id)
      .eq('group_id', groupId)
      .select('id, group_id, data')
      .single();
    if (error) throw error;
    return flatten(data);
  },
  async remove(entity, groupId, id) {
    const { error } = await supabase
      .from(ENTITY_TABLE[entity])
      .delete()
      .eq('id', id)
      .eq('group_id', groupId);
    if (error) throw error;
  },

  // ---- realtime ----------------------------------------------------
  subscribe(groupId, onChange) {
    const channel = supabase
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', filter: `group_id=eq.${groupId}` },
        (payload) => onChange(payload.table),
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
