import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, LockKeyhole, Chrome, Zap, TrendingUp, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: TrendingUp, title: 'Earn from Social Tasks', desc: 'Complete real social media tasks and get paid instantly.', color: 'text-brand-400' },
  { icon: Users,      title: 'Referral Rewards',       desc: 'Invite friends and earn ৳10 bonus for each referral.',  color: 'text-cyan-400' },
  { icon: ShieldCheck,title: 'Secure Payouts',         desc: 'Withdraw via bKash & Nagad with transparent tracking.', color: 'text-purple-400' },
];

export default function Login() {
  const { user, configured, login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try { await (mode === 'login' ? login : register)(form.email, form.password); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  if (!configured) return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950">
      <div className="card max-w-lg w-full text-center">
        <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-4">
          <Zap size={28} className="text-white" fill="white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Configure Firebase to continue</h1>
        <p className="mt-3 text-slate-400">
          Copy <code className="text-brand-400 bg-slate-800 px-1 rounded">.env.example</code> to{' '}
          <code className="text-brand-400 bg-slate-800 px-1 rounded">.env.local</code>, add your Firebase web app values, and restart Vite.
        </p>
      </div>
    </div>
  );

  return (
    <main className="flex min-h-screen bg-slate-950">
      {/* ── LEFT HERO PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-10 overflow-hidden
                      bg-gradient-to-br from-slate-900 via-brand-900/30 to-slate-950">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-500/8 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/6 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-brand-400/5 blur-2xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-900/60 pulse-glow">
            <Zap size={22} className="text-white" fill="white" />
          </div>
          <span className="text-2xl font-black gradient-text tracking-tight">SocialEarn</span>
        </div>

        {/* Central hero */}
        <div className="relative">
          {/* Big floating coin illustration */}
          <div className="mb-10 float">
            <div className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 shadow-2xl shadow-brand-900/70 flex items-center justify-center border-4 border-brand-400/30">
              <span className="text-6xl select-none" aria-hidden>💰</span>
            </div>
            {/* Orbiting dots */}
            <div className="relative -mt-4 flex justify-center gap-2">
              {['bg-brand-400', 'bg-cyan-400', 'bg-amber-400'].map((c, i) => (
                <div key={i} className={`h-2 w-2 rounded-full ${c} opacity-80`} style={{ animationDelay: `${i * 0.4}s` }} />
              ))}
            </div>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight">
            Earn Money<br />
            <span className="gradient-text">Doing What You</span><br />
            <span className="text-white">Already Love</span>
          </h1>
          <p className="mt-4 text-slate-400 text-lg leading-relaxed">
            Complete social media tasks, invite friends,<br />and withdraw to bKash or Nagad instantly.
          </p>

          {/* Stat pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { emoji: '✅', label: '1,200+ Tasks Completed' },
              { emoji: '👥', label: '500+ Active Users' },
              { emoji: '💸', label: '৳50,000+ Paid Out' },
            ].map(({ emoji, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2">
                <span className="text-base" aria-hidden>{emoji}</span>
                <span className="text-sm text-slate-300 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature list */}
        <div className="relative space-y-4">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
                <Icon size={17} className={color} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center pulse-glow">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="text-xl font-black gradient-text">SocialEarn</span>
          </div>

          <h2 className="text-2xl font-black text-white">
            {mode === 'login' ? 'Welcome back 👋' : 'Create account ✨'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login'
              ? 'Sign in to continue earning'
              : 'Start earning from social tasks today'}
          </p>

          {/* Mode toggle tabs */}
          <div className="mt-6 flex rounded-xl border border-white/10 bg-white/5 p-1">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  className="field pl-10 mt-0"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  className="field pl-10 mt-0"
                  type="password"
                  minLength="6"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">
                <span className="mt-0.5 shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {busy ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Please wait...</>
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-600">or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            className="btn-secondary w-full flex items-center justify-center gap-2 py-3"
            onClick={() => loginWithGoogle().catch((e) => setError(e.message))}
          >
            {/* Google SVG icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Help text */}
          <p className="mt-6 text-center text-xs text-slate-600">
            By signing up you agree to our terms of service.{' '}
            <span className="text-brand-500">SocialEarn</span> — earn transparently.
          </p>
        </div>
      </div>
    </main>
  );
}
