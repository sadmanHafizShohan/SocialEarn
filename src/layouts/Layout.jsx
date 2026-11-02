import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, ListChecks, WalletCards, ShieldCheck,
  LogOut, Menu, X, KeyRound, LifeBuoy, Users, Zap,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

export default function Layout() {
  const { user, profile, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    ['/',         'Dashboard',         LayoutDashboard],
    ['/tasks',    'Browse Tasks',      ListChecks],
    ['/unlocks',  'Unlock Categories', KeyRound],
    ['/referral', 'Referral',          Users],
    ['/wallet',   'Wallet',            WalletCards],
    ['/support',  'Live Support',      LifeBuoy],
  ];
  if (profile?.role === 'admin') links.push(['/admin', 'Admin', ShieldCheck]);

  const displayName = profile?.name || user?.displayName || user?.email || 'User';

  return (
    <div className="min-h-screen md:flex bg-slate-950">
      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-10 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`${open ? 'translate-x-0' : '-translate-x-full'}
          fixed inset-y-0 z-20 w-64 flex flex-col
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
          border-r border-white/10 p-5 transition-transform duration-300
          md:static md:translate-x-0`}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl
              bg-gradient-to-br from-brand-500 to-brand-700
              shadow-lg shadow-brand-900/50 group-hover:shadow-brand-500/40 transition-shadow">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="text-xl font-black tracking-tight">
              <span className="text-brand-400">Social</span>
              <span className="text-white">Earn</span>
            </span>
          </Link>
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white md:hidden transition-colors"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive ? 'nav-link-active' : 'nav-link'
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors
                    ${isActive
                      ? 'bg-brand-500/20 text-brand-400'
                      : 'bg-white/5 text-slate-500 group-hover:text-slate-300'
                    }`}>
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 text-sm">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-brand-500/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User profile card at bottom */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <UserAvatar user={profile || user} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-200">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              title="Sign out"
              onClick={logout}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between
          border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-4 md:px-8">
          {/* Mobile burger */}
          <button
            aria-label="Open navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb / page context — empty on desktop, just spacer */}
          <div className="hidden md:block" />

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {/* Earn badge */}
            <span className="hidden sm:flex items-center gap-1.5 rounded-full
              bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 text-xs font-semibold text-brand-400">
              <Zap size={11} fill="currentColor" />
              Earning Mode
            </span>

            <div className="flex items-center gap-2.5">
              <UserAvatar user={profile || user} size="sm" />
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate max-w-[140px]">
                  {displayName}
                </p>
              </div>
            </div>

            <button
              title="Sign out"
              onClick={logout}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
