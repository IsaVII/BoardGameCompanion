import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectUser, signOut } from '../features/auth/authSlice';
import { isCloud } from '../lib/db';
import GroupSwitcher from '../features/groups/GroupSwitcher';

const NAV = [
  { to: '/', label: 'Home', icon: '◆', end: true },
  { to: '/picker', label: 'Tonight', icon: '✦' },
  { to: '/collection', label: 'Shelf', icon: '▤' },
  { to: '/plays', label: 'Plays', icon: '▦' },
  { to: '/lending', label: 'Lending', icon: '↗' },
  { to: '/wishlist', label: 'Wishlist', icon: '☆' },
];

function linkClass({ isActive }) {
  return [
    'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition sm:flex-none sm:flex-row sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm',
    isActive ? 'text-brand sm:bg-edge/60' : 'text-slate-400 hover:text-slate-100',
  ].join(' ');
}

export default function AppShell({ children }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-24 pt-5 sm:pb-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-lg font-black text-slate-950">
            S
          </span>
          <div>
            <p className="text-sm font-bold leading-tight">Shelf</p>
            <p className="text-[11px] text-slate-400">Board game companion</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GroupSwitcher />
          <NavLink
            to="/settings"
            aria-label="Group & account settings"
            className={({ isActive }) =>
              `btn-ghost px-2.5 py-1.5 text-base leading-none ${isActive ? 'border-brand text-brand' : ''}`
            }
          >
            <span aria-hidden>⚙</span>
          </NavLink>
          {isCloud && user && (
            <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => dispatch(signOut())}>
              Sign out
            </button>
          )}
        </div>

        <nav className="hidden w-full gap-1 sm:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
              <span aria-hidden>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-edge bg-surface/95 backdrop-blur sm:hidden">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
            <span aria-hidden className="text-base">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
