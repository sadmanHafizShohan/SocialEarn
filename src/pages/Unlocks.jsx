import { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader } from '../components/Loader';
import { Copy, CheckCircle, Lock, Unlock, Zap, Star, Crown } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Basic',
    amount: 250,
    reward: 15,
    emoji: '🟢',
    icon: Zap,
    gradient: 'from-emerald-900/60 via-emerald-900/30 to-slate-900/80',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-900/40',
    badge: 'badge-green',
    btnCls: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600',
    iconCls: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    textAccent: 'text-emerald-400',
    ringCls: 'ring-emerald-500/30',
    tag: 'Entry Level',
    perks: ['Access to Basic tasks', '৳15 average per task', 'Perfect to start'],
  },
  {
    name: 'Standard',
    amount: 450,
    reward: 35,
    emoji: '🔵',
    icon: Star,
    gradient: 'from-blue-900/60 via-blue-900/30 to-slate-900/80',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-900/40',
    badge: 'badge-blue',
    btnCls: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600',
    iconCls: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    textAccent: 'text-blue-400',
    ringCls: 'ring-blue-500/30',
    tag: 'Popular',
    perks: ['All Basic tasks', 'Access to Standard tasks', '৳35 average per task', '2.3x more earnings'],
  },
  {
    name: 'Premium',
    amount: 850,
    reward: 60,
    emoji: '💎',
    icon: Crown,
    gradient: 'from-purple-900/60 via-purple-900/30 to-slate-900/80',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-900/40',
    badge: 'badge-purple',
    btnCls: 'bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600',
    iconCls: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    textAccent: 'text-purple-400',
    ringCls: 'ring-purple-500/30',
    tag: 'Best Value',
    perks: ['All Basic & Standard', 'Exclusive Premium tasks', '৳60 average per task', 'Priority review', '4x more earnings'],
  },
];

const RECEIVER_NUMBER = '01745634563';

export default function Unlocks() {
  const [status, setStatus] = useState({ categories: {}, requests: [] });
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ paymentMethod: 'bKash', phoneNumber: '', transactionId: '', screenshot: null });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  async function load() {
    try { const r = await api.get('/unlock/status'); setStatus(r.data || { categories: {}, requests: [] }); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function copyReceiverNumber() {
    try { await navigator.clipboard.writeText(RECEIVER_NUMBER); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch (e) { setError('Unable to copy.'); }
  }

  async function submit(event) {
    event.preventDefault();
    const file = form.screenshot;
    if (!file) return setError('Payment screenshot is required.');
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      return setError('Use a JPG, PNG, or WebP image up to 5 MB.');
    setBusy(true); setError(''); setMessage('');
    try {
      const content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await api.post('/unlock/requests', {
        category: selected.name, paymentMethod: form.paymentMethod,
        phoneNumber: form.phoneNumber, transactionId: form.transactionId,
        fileName: file.name, mimeType: file.type, content,
      });
      setMessage('Payment submitted! Admin approval required before tasks unlock.');
      setSelected(null);
      setForm({ paymentMethod: 'bKash', phoneNumber: '', transactionId: '', screenshot: null });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  if (loading) return <Loader className="py-24" label="Loading unlock status..." />;

  return (
    <>
      {/* ── PAGE HEADER ── */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-400">🔑 Task Access</p>
        <h1 className="mt-1 text-3xl font-black text-white">Unlock Task Categories</h1>
        <p className="mt-2 text-slate-500 text-sm max-w-xl">
          Pay a one-time fee to unlock a task category. Each category gives access to higher-paying tasks.
        </p>

        {/* Payment receiver */}
        <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-white/12 bg-white/5 px-4 py-3">
          <div className="text-xl">📲</div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Send payment to this number</p>
            <p className="font-black text-white text-lg tracking-widest">{RECEIVER_NUMBER}</p>
          </div>
          <button
            type="button"
            className={`ml-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 border
              ${copied
                ? 'bg-brand-500/20 border-brand-500/30 text-brand-400'
                : 'bg-white/8 border-white/15 text-slate-300 hover:bg-white/15'}`}
            onClick={copyReceiverNumber}
          >
            {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}
      {message && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-500/10 border border-brand-500/20 px-4 py-3 text-sm text-brand-400">
          ✅ {message}
        </div>
      )}

      {/* ── TIER CARDS ── */}
      <div className="grid gap-5 md:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const unlocked = status.categories?.[cat.name];
          const pending = status.requests?.some((r) => r.category === cat.name && r.status === 'pending');

          return (
            <div
              key={cat.name}
              className={`relative flex flex-col rounded-2xl border ${cat.border} bg-gradient-to-br ${cat.gradient}
                          shadow-xl ${cat.glow} overflow-hidden transition-all duration-300
                          ${unlocked ? 'ring-2 ' + cat.ringCls : 'hover:-translate-y-1 hover:shadow-2xl'}`}
            >
              {/* Popularity tag */}
              {cat.tag && (
                <div className={`absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cat.badge}`}>
                  {cat.tag}
                </div>
              )}

              {/* Background glow */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-15 blur-2xl bg-current pointer-events-none" />

              <div className="relative flex flex-col flex-1 p-6">
                {/* Icon */}
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${cat.iconCls} shadow-lg mb-5`}>
                  <Icon size={22} />
                </div>

                {/* Title */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl" aria-hidden>{cat.emoji}</span>
                  <h2 className="text-xl font-black text-white">{cat.name}</h2>
                </div>

                {/* Unlock fee */}
                <div className="mt-3 mb-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Unlock Fee</p>
                  <p className={`text-4xl font-black ${cat.textAccent}`}>৳{cat.amount}</p>
                  <p className="text-xs text-slate-500 mt-1">one-time payment</p>
                </div>

                {/* Reward per task */}
                <div className={`my-4 inline-flex items-center gap-2 rounded-xl border ${cat.border} bg-white/5 px-3 py-2`}>
                  <Zap size={13} className={cat.textAccent} />
                  <span className="text-sm font-bold text-white">৳{cat.reward}</span>
                  <span className="text-xs text-slate-500">avg per task</span>
                </div>

                {/* Perks list */}
                <ul className="mt-2 space-y-2 flex-1">
                  {cat.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={13} className={cat.textAccent} />
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-6">
                  {unlocked ? (
                    <div className="flex items-center gap-2 rounded-xl bg-brand-500/15 border border-brand-500/30 px-4 py-3 text-sm font-semibold text-brand-400">
                      <Unlock size={15} />
                      Unlocked — tasks available!
                    </div>
                  ) : pending ? (
                    <div className="flex items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-3 text-sm font-semibold text-amber-400">
                      <Lock size={15} />
                      ⏳ Pending Approval...
                    </div>
                  ) : (
                    <button
                      className={`w-full flex items-center justify-center gap-2 rounded-xl ${cat.btnCls}
                                  px-4 py-3 text-sm font-semibold text-white shadow-lg
                                  transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
                      onClick={() => setSelected(cat)}
                    >
                      <Lock size={14} />
                      Submit Payment Proof
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PAYMENT MODAL ── */}
      {selected && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={submit}
            className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            {/* Modal header */}
            <div className={`bg-gradient-to-br ${selected.gradient} border-b ${selected.border} p-6`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>{selected.emoji}</span>
                  <div>
                    <h2 className="text-lg font-black text-white">Unlock {selected.name}</h2>
                    <p className={`text-sm ${selected.textAccent}`}>৳{selected.amount} one-time fee</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelected(null)}
                  className="h-8 w-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-colors text-xl leading-none">
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Payment instruction */}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Send ৳{selected.amount} to</p>
                  <p className="font-black text-white tracking-widest">{RECEIVER_NUMBER}</p>
                </div>
                <button type="button"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-200
                    ${copied ? 'bg-brand-500/20 border-brand-500/30 text-brand-400' : 'bg-white/8 border-white/15 text-slate-300 hover:bg-white/15'}`}
                  onClick={copyReceiverNumber}>
                  {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment Method</span>
                <select className="field bg-slate-900/70" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option>bKash</option>
                  <option>Nagad</option>
                </select>
              </label>

              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sender Phone Number</span>
                <input className="field bg-slate-900/70" required pattern="01[3-9][0-9]{8}" placeholder="01XXXXXXXXX"
                  value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              </label>

              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Transaction ID</span>
                <input className="field bg-slate-900/70" required placeholder="e.g. 8XY9ABC123"
                  value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} />
              </label>

              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment Screenshot</span>
                <div className="mt-1 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/15 hover:border-brand-500/40 bg-white/3 hover:bg-brand-500/5 transition-all duration-200 px-4 py-5 cursor-pointer group">
                  <span className="text-3xl">{form.screenshot ? '🖼️' : '📷'}</span>
                  <p className="text-xs text-slate-400 group-hover:text-white transition-colors">
                    {form.screenshot ? form.screenshot.name : 'Click to upload screenshot'}
                  </p>
                  <input required type="file" accept="image/jpeg,image/png,image/webp" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setForm({ ...form, screenshot: e.target.files?.[0] || null })} />
                </div>
              </label>

              {error && <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">⚠️ {error}</div>}

              <button disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {busy
                  ? <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Uploading...</>
                  : <><CheckCircle size={15} /> Submit for Approval</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
