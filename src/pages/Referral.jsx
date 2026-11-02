import { useState } from 'react';
import { Copy, CheckCircle, Users, Gift, Share2, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_REFERRAL_CODE = 'SE-C7A4AEF1';

export default function Referral() {
  const { profile, applyReferralCode } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const referral = profile?.referral;

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { await applyReferralCode(code); setMessage('Referral code applied! Tasks available after category unlock.'); setCode(''); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(referral?.referralCode || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (e) { setError('Unable to copy the code.'); }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* ── PAGE HEADER ── */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-400">👥 Invite & Earn</p>
        <h1 className="mt-1 text-3xl font-black text-white">Referral Program</h1>
        <p className="mt-1 text-sm text-slate-500">Share your code and earn for every new user</p>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3 sm:gap-4">
        {[
          { step: '1', emoji: '📤', title: 'Share Code', desc: 'Share your unique referral code' },
          { step: '2', emoji: '👤', title: 'Friend Joins', desc: 'New user registers & applies code' },
          { step: '3', emoji: '💰', title: 'You Earn', desc: 'Get ৳10 (100 pts) instantly' },
        ].map(({ step, emoji, title, desc }) => (
          <div key={step} className="relative flex flex-col items-center text-center rounded-2xl border border-white/8 bg-white/3 p-4 overflow-hidden">
            <div className="absolute -top-2 -left-2 h-8 w-8 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-xs font-black text-brand-400">
              {step}
            </div>
            <span className="text-3xl mb-2" aria-hidden>{emoji}</span>
            <p className="font-bold text-white text-sm">{title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      {/* ── YOUR REFERRAL CODE ── */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-900/50 via-brand-900/30 to-slate-900/80 shadow-2xl shadow-brand-900/30 p-6">
        {/* Background decor */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/8 blur-3xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Users size={18} className="text-brand-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Your Referral Code</h2>
              <p className="text-xs text-slate-500">Share this code to earn ৳10 per referral</p>
            </div>
          </div>

          {/* Big code display */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 flex items-center justify-center rounded-xl bg-black/30 border border-white/15 px-6 py-4">
              <code className="text-2xl md:text-3xl font-black tracking-[0.2em] text-brand-300">
                {referral?.referralCode || '⟳ Loading...'}
              </code>
            </div>
            <button
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold text-sm border transition-all duration-300
                ${copied
                  ? 'bg-brand-500/25 border-brand-500/40 text-brand-300'
                  : 'bg-white/8 border-white/15 text-slate-200 hover:bg-white/15 hover:border-white/25'}`}
              onClick={copy}
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Earnings stat */}
          <div className="mt-5 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 px-3 py-2">
              <Gift size={14} className="text-brand-400" />
              <span className="text-sm text-slate-300">
                Earn <span className="font-bold text-brand-400">৳10</span> per referral
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 px-3 py-2">
              <Zap size={14} className="text-amber-400" />
              <span className="text-sm text-slate-300">
                <span className="font-bold text-amber-400">Instant</span> credit
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 px-3 py-2">
              <TrendingUp size={14} className="text-cyan-400" />
              <span className="text-sm text-slate-300">
                <span className="font-bold text-cyan-400">Unlimited</span> referrals
              </span>
            </div>
          </div>

          {/* Share tip */}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/4 border border-white/8 px-3 py-2.5 text-xs text-slate-400">
            <Share2 size={13} className="text-slate-500 shrink-0 mt-0.5" />
            <span>Share on WhatsApp, Facebook, or send directly to friends who want to earn money online.</span>
          </div>
        </div>
      </div>

      {/* Success banner if code applied */}
      {referral?.referredByUserId ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-500/12 border border-brand-500/25 px-5 py-4">
          <div className="h-10 w-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
            <CheckCircle size={18} className="text-brand-400" />
          </div>
          <div>
            <p className="font-semibold text-brand-300">Referral code applied successfully!</p>
            <p className="text-sm text-slate-500 mt-0.5">You can now access tasks after unlocking a category.</p>
          </div>
        </div>
      ) : (
        /* ── APPLY REFERRAL CODE FORM ── */
        <form onSubmit={submit} className="card mt-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Gift size={18} className="text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Apply a Referral Code</h2>
              <p className="text-xs text-slate-500">Required to access tasks on SocialEarn</p>
            </div>
          </div>

          {/* Info tip */}
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-brand-500/8 border border-brand-500/15 px-3 py-2.5 text-sm text-brand-300">
            <span className="shrink-0">💡</span>
            <span>
              No referral code? Use the suggested code{' '}
              <strong className="text-brand-400">{DEFAULT_REFERRAL_CODE}</strong>
            </span>
          </div>

          <div className="flex gap-2">
            <input
              className="field mt-0 flex-1 font-mono tracking-widest uppercase bg-slate-900/70"
              required
              placeholder="SE-ABC12345"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button
              type="button"
              className="btn-secondary shrink-0 text-sm"
              onClick={() => setCode(DEFAULT_REFERRAL_CODE)}
            >
              Use Default
            </button>
          </div>

          {error && <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">⚠️ {error}</div>}
          {message && <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 py-2.5 text-sm text-brand-400">✅ {message}</div>}

          <button disabled={busy} className="btn-primary mt-4 w-full flex items-center justify-center gap-2 py-3">
            {busy
              ? <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Applying...</>
              : <><CheckCircle size={15} /> Apply Code</>}
          </button>
        </form>
      )}
    </div>
  );
}
