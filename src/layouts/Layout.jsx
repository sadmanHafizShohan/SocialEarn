import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ListChecks, WalletCards, ShieldCheck, LogOut, Menu, X, KeyRound, LifeBuoy, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, profile, logout } = useAuth(); const [open, setOpen] = useState(false);
  const links = [[ '/', 'Dashboard', LayoutDashboard], ['/tasks', 'Browse tasks', ListChecks], ['/unlocks', 'Unlock categories', KeyRound], ['/referral', 'Referral', Users], ['/wallet', 'Wallet', WalletCards], ['/support', 'Live support', LifeBuoy]];
  if (profile?.role === 'admin') links.push(['/admin', 'Admin', ShieldCheck]);
  return <div className="min-h-screen md:flex">
    {open && <button aria-label="Close navigation" className="fixed inset-0 z-10 bg-slate-900/30 md:hidden" onClick={() => setOpen(false)} />}
    <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 z-20 w-64 border-r bg-white p-5 transition md:static md:translate-x-0`}>
      <div className="mb-8 flex items-center justify-between"><Link to="/" className="text-2xl font-black text-brand-600">SocialEarn</Link><button className="md:hidden" onClick={() => setOpen(false)}><X /></button></div>
      <nav className="space-y-2">{links.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={18} />{label}</NavLink>)}</nav>
    </aside>
    <main className="min-w-0 flex-1"><header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-8"><button aria-label="Open navigation" className="md:hidden" onClick={() => setOpen(true)}><Menu /></button><div className="ml-auto flex min-w-0 items-center gap-3"><span className="hidden max-w-[60vw] truncate text-sm text-slate-500 sm:block">{user?.email}</span><button className="shrink-0 text-slate-500" title="Sign out" onClick={logout}><LogOut size={18} /></button></div></header><div className="p-4 md:p-8"><Outlet /></div></main>
  </div>;
}
