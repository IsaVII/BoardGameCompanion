import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { signIn, signUp, selectAuthError } from '../features/auth/authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ identifier: '', email: '', username: '', password: '' });
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice('');
    if (mode === 'signin') {
      await dispatch(signIn({ identifier: form.identifier, password: form.password }));
    } else {
      const res = await dispatch(signUp({
        email: form.email,
        username: form.username,
        password: form.password,
      }));
      if (!res.error) {
        setNotice('Account created. If email confirmation is on, check your inbox, then sign in.');
        setForm((f) => ({ ...f, identifier: f.username }));
        setMode('signin');
      }
    }
    setBusy(false);
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-xl font-black text-slate-950">S</span>
          <div>
            <p className="text-lg font-bold leading-tight">Shelf</p>
            <p className="text-xs text-slate-400">Board game companion</p>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex gap-1 rounded-xl bg-canvas p-1 text-sm">
            {['signin', 'signup'].map((m) => (
              <button
                key={m}
                className={`flex-1 rounded-lg py-1.5 font-semibold transition ${mode === m ? 'bg-edge text-slate-100' : 'text-slate-400'}`}
                onClick={() => setMode(m)}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'signin' ? (
              <div>
                <label className="label">Email or username</label>
                <input className="field" value={form.identifier} required autoComplete="username"
                  onChange={(e) => set('identifier', e.target.value)} />
              </div>
            ) : (
              <>
                <div>
                  <label className="label">Username</label>
                  <input className="field" value={form.username} required
                    pattern="[A-Za-z0-9_]{3,}" title="At least 3 letters, digits or underscores"
                    autoComplete="username"
                    onChange={(e) => set('username', e.target.value)} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="field" value={form.email} required autoComplete="email"
                    onChange={(e) => set('email', e.target.value)} />
                </div>
              </>
            )}
            <div>
              <label className="label">Password</label>
              <input type="password" className="field" value={form.password} required minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                onChange={(e) => set('password', e.target.value)} />
            </div>

            {error && <p className="text-sm text-rose-300">{error}</p>}
            {notice && <p className="text-sm text-emerald-300">{notice}</p>}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Your data is game titles, scores and nicknames — nothing sensitive.
        </p>
      </div>
    </div>
  );
}
