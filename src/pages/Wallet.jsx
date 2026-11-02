import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Loader } from '../components/Loader';
import { WalletCards, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock, Send } from 'lucide-react';

const TX_TYPE_ICON = {
  earned:      { icon: TrendingUp,   cls: 'text-brand-400 bg-brand-500/15 border-brand-500/20' },
  withdrawn:   { icon: TrendingDown, cls: 'text-red-400 bg-red-500/15 border-red-500/20' },
  referral:    { icon: ArrowUpRight, cls: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/20' },
  reserved:    { icon: Clock,        cls: 'text-amber-400 bg-amber-500/15 border-amber-500/20' },
  default:     { icon: WalletCards,  cls: 'text-slate-400 bg-slate-500/15 border-slate-500/20' },
};

function txStyle(type, points) {
  const key = type?.toLowerCase() || 'default';
  const style = TX_TYPE_ICON[key] || TX_TYPE_ICON.default;
  return { ...style, isPositive: Number(points) > 0 };
}

const WITHDRAWAL_STATUS = {
  pending:   { cls: 'badge-amber',  emoji: '⏳' },
  approved:  { cls: 'badge-green',  emoji: '✅' },
  rejected:  { cls: 'badge-red',    emoji: '❌' },
  paid:      { cls: 'badge-green',  emoji: '💸' },
};

export default function Wallet() {
  const [data, setData] = useState({ wallet: {}, withdrawals: [], transactions: [] });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: { balanceType: 'regular' } });
  const balanceType = watch('balanceType');
  const available = balanceType === 'referral'
    ? Number(data.wallet.referralPoints || 0)
    : Number(data.wallet.availablePoints || 0);

  async function load() {
    const [wallet, withdrawals, transactions] = await Promise.all([
      api.get('/wallet'), api.get('/withdrawals/my'), api.get('/transactions')
    ]);
    setData({
      wallet: wallet.data?.wallet || wallet.data || {},
      withdrawals: withdrawals.data?.items || withdrawals.data || [],
      transactions: transactions.data?.items || transactions.data || [],
    });
  }

  useEffect(() => {
    load().catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function withdraw(values) {
    setError(''); setMessage(''); setBusy(true);
    try {
      await api.post('/withdrawals', { ...values, points: Number(values.points) });
      setMessage('Withdrawal request submitted.');
      reset({ balanceType: values.balanceType });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const totalAvail = Number(data.wallet.availablePoints || 0) + Number(data.wallet.referralPoints || 0);

  return (
    <>
      {/* ── PAGE HEADER ── */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-400">💰 Your Earnings</p>
        <h1 className="mt-1 text-3xl font-black text-white">Wallet</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your points and request payouts</p>
      </div>

      {loading ? (
        <Loader className="py-24" label="Loading wallet..." />
      ) : (
        <>
          {/* ── BALANCE CARDS ── */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Available',         value: data.wallet.availablePoints || 0,    emoji: '💰', gradient: 'from-brand-600/40 to-brand-900/60 border-brand-500/25',   text: 'text-brand-300' },
              { label: 'Referral Earnings', value: data.wallet.referralPoints || 0,     emoji: '👥', gradient: 'from-cyan-600/40 to-cyan-900/60 border-cyan-500/25',      text: 'text-cyan-300' },
              { label: 'Reserved',          value: data.wallet.reservedPoints || 0,     emoji: '⏳', gradient: 'from-amber-600/40 to-amber-900/60 border-amber-500/25',   text: 'text-amber-300' },
              { label: 'Est. Value (৳)',    value: `৳${Math.floor(totalAvail / 10)}`,   emoji: '💸', gradient: 'from-violet-600/40 to-violet-900/60 border-violet-500/25', text: 'text-violet-300', isValue: true },
            ].map(({ label, value, emoji, gradient, text, isValue }) => (
              <div key={label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br border ${gradient} p-5 shadow-xl`}>
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-current opacity-10 blur-xl" />
                <div className="text-3xl mb-3" aria-hidden>{emoji}</div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                <p className={`mt-1 text-2xl font-black ${text}`}>
                  {isValue ? value : Number(value).toLocaleString()}
                  {!isValue && <span className="ml-1 text-xs text-slate-600 font-normal">pts</span>}
                </p>
              </div>
            ))}
          </div>

          {/* ── VISUAL WALLET CARD ── */}
          <div className="mt-6 relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-violet-700 via-blue-700 to-cyan-700 border border-white/15 p-6 md:p-8">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-violet-400/15 blur-xl" />
              {/* Card chip decor */}
              <div className="absolute top-6 right-6 h-10 w-14 rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm" />
            </div>
            <div className="relative">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50">SocialEarn Wallet</p>
                  <p className="mt-2 text-4xl font-black text-white">
                    ৳{Math.floor(totalAvail / 10)}
                    <span className="ml-2 text-lg text-white/50 font-normal">total</span>
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <WalletCards size={24} className="text-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Task Points</p>
                  <p className="text-white font-bold mt-0.5">{Number(data.wallet.availablePoints || 0).toLocaleString()} pts</p>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Referral Points</p>
                  <p className="text-white font-bold mt-0.5">{Number(data.wallet.referralPoints || 0).toLocaleString()} pts</p>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Reserved</p>
                  <p className="text-white font-bold mt-0.5">{Number(data.wallet.reservedPoints || 0).toLocaleString()} pts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* ── WITHDRAWAL FORM ── */}
            <form className="card" onSubmit={handleSubmit(withdraw)}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <Send size={16} className="text-brand-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Request Withdrawal</h2>
                  <p className="text-xs text-slate-500">100 pts = ৳10</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Balance Type</span>
                  <select className="field bg-slate-900/70" {...register('balanceType')}>
                    <option value="regular">💼 Task Earnings (min 1,000 pts)</option>
                    <option value="referral">👥 Referral Earnings (any amount)</option>
                  </select>
                </label>

                <div className="flex items-center gap-2 rounded-xl bg-white/4 border border-white/8 px-3 py-2.5">
                  <span className="text-xs text-slate-500">Available:</span>
                  <span className="font-bold text-white">{available.toLocaleString()}</span>
                  <span className="text-xs text-slate-600">points = ৳{Math.floor(available / 10)}</span>
                </div>

                <label className="block text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Points to Withdraw</span>
                  <input
                    className="field bg-slate-900/70"
                    type="number"
                    min={balanceType === 'referral' ? 1 : 1000}
                    max={available}
                    step="1"
                    required
                    {...register('points')}
                  />
                </label>

                <label className="block text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment Method</span>
                  <select className="field bg-slate-900/70" {...register('paymentMethod')}>
                    <option>bKash</option>
                    <option>Nagad</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Number</span>
                  <input
                    className="field bg-slate-900/70"
                    inputMode="numeric"
                    pattern="01[3-9][0-9]{8}"
                    placeholder="01XXXXXXXXX"
                    required
                    {...register('accountNumber')}
                  />
                </label>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">
                  ⚠️ {error}
                </div>
              )}
              {message && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 py-2.5 text-sm text-brand-400">
                  ✅ {message}
                </div>
              )}

              <button disabled={busy} className="btn-primary mt-5 w-full flex items-center justify-center gap-2 py-3">
                {busy
                  ? <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Submitting...</>
                  : <><Send size={15} /> Request Payout</>}
              </button>
            </form>

            {/* ── RECENT WITHDRAWALS ── */}
            <section className="card">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <ArrowDownRight size={16} className="text-violet-400" />
                </div>
                <h2 className="font-bold text-white">Recent Withdrawals</h2>
              </div>

              {data.withdrawals.length ? (
                <div className="space-y-3">
                  {data.withdrawals.map((item) => {
                    const s = WITHDRAWAL_STATUS[item.status?.toLowerCase()] || { cls: 'badge-blue', emoji: '🔵' };
                    return (
                      <div key={item.withdrawalId} className="flex items-center justify-between gap-3 rounded-xl bg-white/4 border border-white/8 px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-lg">
                            {s.emoji}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              ৳{Math.floor(item.amountPaisa / 100)}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">
                              {item.balanceType === 'referral' ? '👥 Referral' : '💼 Task'}
                            </p>
                          </div>
                        </div>
                        <span className={s.cls}>{item.status}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="text-4xl mb-3">💸</span>
                  <p className="text-sm text-slate-500">No withdrawals yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Earn 1,000+ points to request your first payout.</p>
                </div>
              )}
            </section>
          </div>

          {/* ── TRANSACTIONS ── */}
          <section className="card mt-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <TrendingUp size={16} className="text-blue-400" />
              </div>
              <h2 className="font-bold text-white">Transaction History</h2>
            </div>

            {data.transactions.length ? (
              <div className="space-y-2">
                {data.transactions.map((item) => {
                  const { icon: TxIcon, cls, isPositive } = txStyle(item.type, item.points);
                  return (
                    <div key={item.transactionId} className="flex items-center justify-between gap-3 rounded-xl bg-white/3 border border-white/6 px-3 py-3 hover:bg-white/6 transition-colors duration-150">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${cls}`}>
                          <TxIcon size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white capitalize">{item.type}</p>
                          <p className="text-xs text-slate-500 truncate">{item.description}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${isPositive ? 'text-brand-400' : 'text-red-400'}`}>
                        {Number(item.points) > 0 ? '+' : ''}{item.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="text-4xl mb-3">📊</span>
                <p className="text-sm text-slate-500">No transactions yet.</p>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
