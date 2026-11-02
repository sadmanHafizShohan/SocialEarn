import { Link } from 'react-router-dom';
import { ArrowUpRight, Coins, Clock3, CircleCheck, WalletCards, TrendingUp, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader, Skeleton } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

const initial = {
  wallet: { availablePoints: 0, reservedPoints: 0, totalEarnedPoints: 0, totalWithdrawnPoints: 0 },
  stats: { completedTasks: 0, pendingSubmissions: 0, rejectedSubmissions: 0 },
  recentSubmissions: [],
  recentTransactions: [],
};

const STATUS_BADGE = {
  approved:  { cls: 'badge-green',  dot: '🟢', label: 'Approved' },
  pending:   { cls: 'badge-amber',  dot: '🟡', label: 'Pending' },
  rejected:  { cls: 'badge-red',    dot: '🔴', label: 'Rejected' },
  reviewing: { cls: 'badge-blue',   dot: '🔵', label: 'Reviewing' },
};

function statusBadge(status) {
  const s = STATUS_BADGE[status?.toLowerCase()] || { cls: 'badge-blue', dot: '⚪', label: status };
  return <span className={s.cls}>{s.dot} {s.label}</span>;
}

function StatCard({ label, value, Icon, gradient, iconColor, shadow, emoji }) {
  return (
    <div className={`rounded-2xl p-5 relative overflow-hidden border ${gradient} shadow-xl ${shadow}`}>
      {/* Background glow orb */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-xl bg-current" />
      <div className="relative">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/15 ${iconColor} shadow-lg`}>
          <Icon size={20} />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/50">{label}</p>
        <p className="mt-1 text-3xl font-black text-white">{value.toLocaleString()}</p>
        <p className="mt-1 text-xs text-white/30">{emoji}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [data, setData] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((r) => setData((v) => ({ ...v, ...r.data })))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Available Points',
      value: data.wallet.availablePoints,
      Icon: Coins,
      gradient: 'bg-gradient-to-br from-brand-600/40 to-brand-900/60 border-brand-500/25',
      iconColor: 'text-brand-300',
      shadow: 'shadow-brand-900/40',
      emoji: '💰 Ready to withdraw',
    },
    {
      label: 'Reserved Points',
      value: data.wallet.reservedPoints,
      Icon: Clock3,
      gradient: 'bg-gradient-to-br from-amber-600/40 to-amber-900/60 border-amber-500/25',
      iconColor: 'text-amber-300',
      shadow: 'shadow-amber-900/40',
      emoji: '⏳ Under review',
    },
    {
      label: 'Total Earned',
      value: data.wallet.totalEarnedPoints,
      Icon: TrendingUp,
      gradient: 'bg-gradient-to-br from-blue-600/40 to-blue-900/60 border-blue-500/25',
      iconColor: 'text-blue-300',
      shadow: 'shadow-blue-900/40',
      emoji: '📈 All-time earnings',
    },
    {
      label: 'Withdrawn',
      value: data.wallet.totalWithdrawnPoints,
      Icon: WalletCards,
      gradient: 'bg-gradient-to-br from-violet-600/40 to-violet-900/60 border-violet-500/25',
      iconColor: 'text-violet-300',
      shadow: 'shadow-violet-900/40',
      emoji: '✅ Successfully paid out',
    },
  ];

  return (
    <>
      {/* ── HERO BANNER ── */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/80 via-brand-900/20 to-slate-900/80 p-6 md:p-8 shadow-2xl">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/8 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-cyan-500/5 blur-2xl" />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <UserAvatar user={profile || user} size="lg" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 border-2 border-slate-900 flex items-center justify-center">
                <Sparkles size={10} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-400">Dashboard Overview</p>
              <h1 className="mt-0.5 text-2xl font-black text-white">
                Hey, {profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'there'} 👋
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {data.wallet.availablePoints > 0
                  ? `You have ${data.wallet.availablePoints.toLocaleString()} points ready to withdraw!`
                  : 'Start completing tasks to earn points.'}
              </p>
            </div>
          </div>
          <Link
            className="btn-primary flex items-center gap-2 shrink-0"
            to="/tasks"
          >
            <CircleCheck size={16} />
            Browse Tasks
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Quick-stat strip */}
        <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Completed', value: data.stats?.completedTasks || 0, emoji: '✅', color: 'text-brand-400' },
            { label: 'Pending',   value: data.stats?.pendingSubmissions || 0, emoji: '⏳', color: 'text-amber-400' },
            { label: 'Rejected',  value: data.stats?.rejectedSubmissions || 0, emoji: '❌', color: 'text-red-400' },
          ].map(({ label, value, emoji, color }) => (
            <div key={label} className="rounded-xl bg-white/5 border border-white/8 px-3 py-2.5 text-center">
              <span className="text-xl">{emoji}</span>
              <p className={`mt-1 text-lg font-black ${color}`}>{value}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* ── STAT CARDS ── */}
      {loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label }) => (
              <div className="card h-36" key={label}>
                <Skeleton className="h-11 w-11" />
                <Skeleton className="mt-4 h-3 w-24" />
                <Skeleton className="mt-2 h-8 w-20" />
              </div>
            ))}
          </div>
          <Loader className="mt-10" label="Loading dashboard..." />
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => <StatCard key={card.label} {...card} />)}
          </div>

          {/* Conversion rate banner */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-500/20 bg-brand-500/8 px-4 py-3 text-sm">
            <span className="text-lg">💡</span>
            <span className="text-brand-300">
              <strong>100 points = ৳10</strong>
              <span className="text-slate-400 ml-2">— rates are snapshotted at the time of each earning & withdrawal.</span>
            </span>
          </div>

          {/* ── RECENT ACTIVITY ── */}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {/* Recent Submissions */}
            <section className="card slide-up">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <CircleCheck size={14} className="text-blue-400" />
                  </div>
                  <h2 className="font-bold text-white">Recent Submissions</h2>
                </div>
                <Link className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1" to="/tasks">
                  Browse tasks <ArrowUpRight size={12} />
                </Link>
              </div>

              {data.recentSubmissions?.length ? (
                <div className="space-y-3">
                  {data.recentSubmissions.map((item) => (
                    <div
                      key={item.submissionId}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/4 border border-white/8 px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {item.taskTitle || item.taskId}
                        </p>
                      </div>
                      {statusBadge(item.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="text-4xl mb-3">📋</span>
                  <p className="text-sm text-slate-500">No submissions yet.</p>
                  <Link className="mt-3 text-sm text-brand-400 hover:text-brand-300" to="/tasks">
                    Start your first task →
                  </Link>
                </div>
              )}
            </section>

            {/* Wallet Summary */}
            <section className="card slide-up">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <WalletCards size={14} className="text-violet-400" />
                </div>
                <h2 className="font-bold text-white">Wallet Summary</h2>
              </div>

              {/* Visual wallet card */}
              <div className="rounded-xl bg-gradient-to-br from-violet-600/30 via-blue-600/20 to-cyan-600/20 border border-violet-500/20 p-5 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-violet-500/10 blur-xl" />
                <p className="text-xs text-slate-400 uppercase tracking-wider">Available Balance</p>
                <p className="mt-1 text-3xl font-black text-white">
                  ৳{Math.floor(data.wallet.availablePoints / 10)}
                  <span className="ml-2 text-sm text-slate-400 font-normal">
                    ({data.wallet.availablePoints.toLocaleString()} pts)
                  </span>
                </p>
                <div className="mt-4 flex gap-4 text-xs text-slate-400">
                  <div>
                    <p className="text-white font-semibold">৳{Math.floor(data.wallet.reservedPoints / 10)}</p>
                    <p>Reserved</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="text-white font-semibold">৳{Math.floor(data.wallet.totalEarnedPoints / 10)}</p>
                    <p>Total Earned</p>
                  </div>
                </div>
              </div>

              <Link
                className="mt-4 flex items-center justify-center gap-2 w-full btn-secondary text-sm py-2.5"
                to="/wallet"
              >
                <WalletCards size={15} />
                View Wallet & Withdrawals
              </Link>
            </section>
          </div>
        </>
      )}
    </>
  );
}
