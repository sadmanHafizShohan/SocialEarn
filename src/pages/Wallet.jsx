import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Loader } from '../components/Loader';

export default function Wallet() {
  const [data, setData] = useState({ wallet: {}, withdrawals: [], transactions: [] }); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    Promise.all([api.get('/wallet'), api.get('/withdrawals/my'), api.get('/transactions')])
      .then(([wallet, withdrawals, transactions]) => setData({
        wallet: wallet.data?.wallet || wallet.data || {},
        withdrawals: withdrawals.data?.items || withdrawals.data || [],
        transactions: transactions.data?.items || transactions.data || []
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  async function withdraw(values) { setError(''); setMessage(''); setBusy(true); try { await api.post('/withdrawals', { ...values, points: Number(values.points) }); setMessage('Withdrawal request submitted.'); reset(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <><h1 className="text-3xl font-bold">Wallet</h1>{loading ? <Loader className="py-16" label="Loading wallet..." /> : <><div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="card"><p className="text-sm text-slate-500">Available</p><b className="text-2xl">{data.wallet.availablePoints || 0}</b> points</div><div className="card"><p className="text-sm text-slate-500">Reserved</p><b className="text-2xl">{data.wallet.reservedPoints || 0}</b> points</div><div className="card"><p className="text-sm text-slate-500">Estimated value</p><b className="text-2xl">৳{Math.floor((data.wallet.availablePoints || 0) / 10)}</b></div></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><form className="card" onSubmit={handleSubmit(withdraw)}><h2 className="font-bold">Request withdrawal</h2><label className="mt-4 block text-sm">Points<input className="field" type="number" min="1000" step="1" required {...register('points')} /></label><label className="mt-3 block text-sm">Payment method<select className="field" {...register('paymentMethod')}><option>bKash</option><option>Nagad</option></select></label><label className="mt-3 block text-sm">Account number<input className="field" inputMode="numeric" pattern="01[3-9][0-9]{8}" required {...register('accountNumber')} /></label>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}{message && <p className="mt-3 text-sm text-brand-700">{message}</p>}<button disabled={busy} className="btn-primary mt-4">{busy ? 'Submitting...' : 'Request payout'}</button></form><section className="card"><h2 className="font-bold">Recent withdrawals</h2>{data.withdrawals.length ? data.withdrawals.map((item) => <div className="mt-4 flex justify-between gap-3 border-b pb-3 text-sm" key={item.withdrawalId}><span>৳{Math.floor(item.amountPaisa / 100)}</span><span className="capitalize text-slate-500">{item.status}</span></div>) : <p className="mt-5 text-sm text-slate-500">No withdrawals yet.</p>}</section></div><section className="card mt-6"><h2 className="font-bold">Recent transactions</h2>{data.transactions.length ? data.transactions.map((item) => <div className="mt-4 flex flex-wrap justify-between gap-2 border-b pb-3 text-sm" key={item.transactionId}><span className="capitalize">{item.type} · {item.description}</span><span className={Number(item.points) < 0 ? 'text-red-600' : 'text-green-600'}>{Number(item.points) > 0 ? '+' : ''}{item.points} points</span></div>) : <p className="mt-5 text-sm text-slate-500">No transactions yet.</p>}</section></>}</>;
}
