import { Search, ChevronRight, Zap, Clock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader } from '../components/Loader';
import { Link } from 'react-router-dom';

// Platform emoji map
const PLATFORM_EMOJI = {
  facebook:  { emoji: '📘', color: 'from-blue-500/20 to-blue-900/40 border-blue-500/20 text-blue-300' },
  instagram: { emoji: '📸', color: 'from-pink-500/20 to-purple-900/40 border-pink-500/20 text-pink-300' },
  tiktok:    { emoji: '🎵', color: 'from-slate-500/20 to-slate-900/40 border-slate-400/20 text-slate-300' },
  twitter:   { emoji: '🐦', color: 'from-sky-500/20 to-sky-900/40 border-sky-500/20 text-sky-300' },
  youtube:   { emoji: '📺', color: 'from-red-500/20 to-red-900/40 border-red-500/20 text-red-300' },
  linkedin:  { emoji: '💼', color: 'from-blue-700/20 to-blue-900/40 border-blue-700/20 text-blue-400' },
  telegram:  { emoji: '✈️', color: 'from-cyan-500/20 to-cyan-900/40 border-cyan-500/20 text-cyan-300' },
};

const CATEGORY_BADGE = {
  Basic:    'badge-green',
  Standard: 'badge-blue',
  Premium:  'badge-purple',
};

function getPlatform(platform = '') {
  const key = platform.toLowerCase().trim();
  return PLATFORM_EMOJI[key] || { emoji: '🌐', color: 'from-slate-500/20 to-slate-900/40 border-slate-400/20 text-slate-300' };
}

function TaskCard({ task }) {
  const cats = task.availableCategories || [task.category];
  const maxPts = task.maxPoints || task.points;
  const platform = getPlatform(task.platform);
  const spots = task.remainingParticipants ?? task.maxParticipants;

  return (
    <Link
      className="group flex flex-col rounded-2xl border border-white/8 bg-slate-900/70 backdrop-blur-sm
                 shadow-xl overflow-hidden transition-all duration-300
                 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:bg-slate-800/80"
      to={`/tasks/${task.taskId}`}
    >
      {/* Top gradient strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${platform.color.split(' ')[0]} ${platform.color.split(' ')[1]}`} />

      <div className="flex flex-col flex-1 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          {/* Platform icon */}
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br border ${platform.color} shadow-lg text-2xl`}>
            {platform.emoji}
          </div>
          {/* Category badges */}
          <div className="flex flex-wrap justify-end gap-1">
            {cats.map((c) => (
              <span key={c} className={CATEGORY_BADGE[c] || 'badge-blue'}>{c}</span>
            ))}
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-4 font-bold text-white leading-snug group-hover:text-brand-300 transition-colors duration-200">
          {task.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500 flex-1">
          {task.description}
        </p>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between gap-3">
          {/* Reward */}
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Zap size={11} className="text-brand-400" />
            </div>
            <span className="font-black text-brand-400">
              ৳{Math.floor(maxPts / 10)}
            </span>
            <span className="text-xs text-slate-600">({maxPts} pts)</span>
          </div>

          {/* Spots remaining */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Users size={12} />
            <span>{spots ?? '∞'} spots</span>
          </div>

          <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all duration-200" />
        </div>

        {/* Platform label */}
        <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${platform.color.split(' ').slice(-1)[0]}`}>
          <Clock size={11} />
          <span>{task.platform}</span>
        </div>
      </div>
    </Link>
  );
}

const CATEGORIES = ['all', 'Basic', 'Standard', 'Premium'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks')
      .then((r) => setTasks(r.data?.items || r.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks
    .filter((task) => {
      const categories = task.availableCategories || [task.category];
      return (
        (category === 'all' || categories.includes(category)) &&
        `${task.title} ${task.platform} ${categories.join(' ')}`.toLowerCase().includes(query.toLowerCase())
      );
    })
    .sort((a, b) =>
      sort === 'points' ? Number(b.maxPoints || b.points) - Number(a.maxPoints || a.points)
      : sort === 'title' ? String(a.title).localeCompare(String(b.title))
      : new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

  const pageSize = 9;
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <>
      {/* ── PAGE HEADER ── */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-400">💼 Earn Money</p>
        <h1 className="mt-1 text-3xl font-black text-white">Available Tasks</h1>
        <p className="mt-1 text-slate-500 text-sm">Complete tasks and earn points. 100 pts = ৳10</p>

        {/* ── FILTERS ── */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              className="field pl-10 mt-0 bg-slate-900/80"
              placeholder="Search tasks, platforms..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>

          {/* Sort */}
          <select
            className="field mt-0 sm:w-36 bg-slate-900/80"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">🕐 Newest</option>
            <option value="points">💰 Reward</option>
            <option value="title">🔤 Title</option>
          </select>
        </div>

        {/* Category tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1); }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 border
                ${category === c
                  ? c === 'all'     ? 'bg-white/15 border-white/30 text-white'
                  : c === 'Basic'   ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : c === 'Standard'? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  :                   'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/4 border-white/10 text-slate-400 hover:bg-white/8 hover:text-white'}`}
            >
              {c === 'all' ? '🌐 All' : c === 'Basic' ? '🟢 Basic' : c === 'Standard' ? '🔵 Standard' : '💎 Premium'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <span>⚠️</span>
          <span>{error} — <Link className="underline hover:text-red-300" to="/referral">Apply referral code</Link></span>
        </div>
      )}

      {loading ? (
        <Loader className="py-24" label="Loading tasks..." />
      ) : (
        <>
          {/* Task count */}
          <p className="mb-4 text-xs text-slate-500">
            Showing <span className="text-white font-semibold">{visible.length}</span> of <span className="text-white font-semibold">{filtered.length}</span> tasks
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((task) => <TaskCard key={task.taskId} task={task} />)}
            {!filtered.length && (
              <div className="md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-slate-400 font-semibold">No tasks match your search.</p>
                <p className="text-sm text-slate-600 mt-1">Try changing the category or search terms.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filtered.length > pageSize && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                className="btn-secondary disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage((v) => v - 1)}
              >
                ← Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-sm font-semibold transition-all duration-200 border
                      ${p === page
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 border-brand-500/30 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                className="btn-secondary disabled:opacity-40"
                disabled={page === totalPages}
                onClick={() => setPage((v) => v + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
