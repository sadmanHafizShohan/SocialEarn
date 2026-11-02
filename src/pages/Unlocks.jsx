import { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader } from '../components/Loader';

const categories = [
  { name: 'Basic', amount: 100, points: 10 },
  { name: 'Standard', amount: 300, points: 25 },
  { name: 'Premium', amount: 500, points: 50 }
];

export default function Unlocks() {
  const [status, setStatus] = useState({ categories: {}, requests: [] });
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ paymentMethod: 'bKash', phoneNumber: '', transactionId: '', screenshot: null });
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  async function load() {
    try { const response = await api.get('/unlock/status'); setStatus(response.data || { categories: {}, requests: [] }); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function submit(event) {
    event.preventDefault(); const file = form.screenshot;
    if (!file) return setError('Payment screenshot is required.');
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setError('Use a JPG, PNG, or WebP image up to 5 MB.');
    setBusy(true); setError(''); setMessage('');
    try {
      const content = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
      await api.post('/unlock/requests', { category: selected.name, paymentMethod: form.paymentMethod, phoneNumber: form.phoneNumber, transactionId: form.transactionId, fileName: file.name, mimeType: file.type, content });
      setMessage('Payment submitted. Admin approval is required before tasks unlock.'); setSelected(null); setForm({ paymentMethod: 'bKash', phoneNumber: '', transactionId: '', screenshot: null }); await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  if (loading) return <Loader className="py-16" label="Loading unlock status..." />;
  return <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Task access</p><h1 className="mt-1 text-3xl font-bold">Unlock task categories</h1><p className="mt-3 max-w-2xl text-slate-600">Send the exact amount to bKash/Nagad: <b>01745634563</b>. Upload your payment proof for manual approval.</p>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}<div className="mt-6 grid gap-4 md:grid-cols-3">{categories.map((category) => { const unlocked = status.categories?.[category.name]; const pending = status.requests?.some((request) => request.category === category.name && request.status === 'pending'); return <div className="card" key={category.name}><h2 className="text-xl font-bold">{category.name}</h2><p className="mt-2 text-sm text-slate-500">Unlock fee</p><p className="text-2xl font-bold text-brand-600">৳{category.amount}</p><p className="mt-2 text-sm text-slate-500">{category.points} points per task</p>{unlocked ? <p className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">Unlocked</p> : pending ? <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">Pending approval</p> : <button className="btn-primary mt-5 w-full" onClick={() => setSelected(category)}>Submit payment proof</button>}</div>; })}</div>{selected && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4"><form onSubmit={submit} className="card max-h-[90vh] w-full max-w-lg overflow-y-auto"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Unlock {selected.name}</h2><button type="button" onClick={() => setSelected(null)} className="text-slate-500">Close</button></div><p className="mt-2 text-sm text-slate-600">Send ৳{selected.amount} to 01745634563 via bKash or Nagad.</p><label className="mt-4 block text-sm">Payment method<select className="field" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}><option>bKash</option><option>Nagad</option></select></label><label className="mt-3 block text-sm">Sender phone number<input className="field" required pattern="01[3-9][0-9]{8}" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></label><label className="mt-3 block text-sm">Transaction ID<input className="field" required value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} /></label><label className="mt-3 block text-sm">Payment screenshot<input className="field" required type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setForm({ ...form, screenshot: e.target.files?.[0] || null })} /></label><button disabled={busy} className="btn-primary mt-5 w-full">{busy ? 'Uploading...' : 'Submit for approval'}</button></form></div>}</div>;
}
