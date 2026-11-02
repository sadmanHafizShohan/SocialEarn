import { useState } from 'react';
import { Copy, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_REFERRAL_CODE = 'SE-C7A4AEF1';

export default function Referral() {
  const { profile, applyReferralCode } = useAuth();
  const [code, setCode] = useState(''); const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const referral = profile?.referral;
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { await applyReferralCode(code); setMessage('Referral code applied. Tasks are now available after category unlock.'); setCode(''); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(referral?.referralCode || ''); setMessage('Referral code copied.'); }
    catch (e) { setError('Unable to copy the code.'); }
  }
  return <div className="mx-auto max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Invite and earn</p><h1 className="mt-1 text-3xl font-bold">Referral program</h1><div className="card mt-6"><div className="flex items-center gap-3"><Users className="text-brand-600" /><div><h2 className="font-bold">Your referral code</h2><p className="text-sm text-slate-500">Share this code with new SocialEarn users.</p></div></div><div className="mt-5 flex flex-wrap items-center gap-3"><code className="rounded-xl bg-slate-100 px-4 py-3 text-lg font-bold tracking-wider">{referral?.referralCode || 'Loading...'}</code><button className="btn-secondary flex items-center gap-2" onClick={copy}><Copy size={16} /> Copy</button></div><p className="mt-4 text-sm text-slate-600">You receive <b>৳10</b> (100 points) instantly when a new user applies your code.</p></div>{referral?.referredByUserId ? <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">Referral code applied successfully. You can now access tasks after unlocking a category.</div> : <form onSubmit={submit} className="card mt-6"><h2 className="font-bold">Apply a referral code</h2><p className="mt-1 text-sm text-slate-500">A referral code is required before you can access tasks.</p><div className="mt-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">No referral code? Use the suggested code <b>{DEFAULT_REFERRAL_CODE}</b>.</div><div className="mt-3 flex gap-2"><input className="field mt-0" required placeholder="Example: SE-ABC12345" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /><button type="button" className="btn-secondary shrink-0" onClick={() => setCode(DEFAULT_REFERRAL_CODE)}>Use suggestion</button></div>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}{message && <p className="mt-3 text-sm text-brand-700">{message}</p>}<button disabled={busy} className="btn-primary mt-4">{busy ? 'Applying...' : 'Apply code'}</button></form>}</div>;
}
