import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Loader } from '../components/Loader';
import { ArrowLeft, Upload, Zap, Calendar, Users, CheckCircle, Lock, ChevronDown } from 'lucide-react';

const PLATFORM_EMOJI = {
  facebook: '📘', instagram: '📸', tiktok: '🎵', twitter: '🐦',
  youtube: '📺', linkedin: '💼', telegram: '✈️',
};

const CATEGORY_STYLES = {
  Basic:    { cls: 'badge-green',  bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-900/30' },
  Standard: { cls: 'badge-blue',   bg: 'bg-blue-500/10    border-blue-500/20',    text: 'text-blue-400',    glow: 'shadow-blue-900/30' },
  Premium:  { cls: 'badge-purple', bg: 'bg-purple-500/10  border-purple-500/20',  text: 'text-purple-400',  glow: 'shadow-purple-900/30' },
};

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const [task, setTask] = useState(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/tasks/${taskId}`)
      .then((r) => { setTask(r.data); setCategory(r.data.unlockedCategories?.[0] || ''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [taskId]);

  async function submit(values) {
    const file = values.screenshot?.[0];
    if (!file) return setError('Please choose a screenshot.');
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      return setError('Use a JPG, PNG, or WebP image up to 5 MB.');
    setBusy(true); setError('');
    try {
      const content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await api.post('/submissions', { taskId, category, fileName: file.name, mimeType: file.type, size: file.size, content });
      setMessage('Submitted for administrator review.');
      reset();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  if (error && !task) return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="text-5xl">❌</span>
      <p className="text-red-400">{error}</p>
      <button className="btn-secondary" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );

  if (loading || !task) return <Loader className="py-24" label="Loading task..." />;

  const cats = task.availableCategories || [task.category];
  const platformKey = task.platform?.toLowerCase().trim();
  const platformEmoji = PLATFORM_EMOJI[platformKey] || '🌐';
  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.Basic;
  const reward = task.categoryPoints?.[category] || task.points;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back button */}
      <button
        className="mb-5 flex items-center gap-2 text-sm text-slate-400 hover:text-brand-400 transition-colors duration-200"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Back to tasks
      </button>

      {/* ── TASK HEADER CARD ── */}
      <article className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Hero strip */}
        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-b border-white/8 p-6 md:p-8">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/5 blur-3xl" />
          </div>
          <div className="relative flex flex-wrap items-start gap-4">
            {/* Platform icon */}
            <div className="text-5xl select-none leading-none">{platformEmoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                {cats.map((c) => (
                  <span key={c} className={CATEGORY_STYLES[c]?.cls || 'badge-blue'}>{c}</span>
                ))}
                <span className="badge bg-slate-700/50 text-slate-300 border border-slate-600/30">
                  {task.platform}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white leading-snug">{task.title}</h1>
            </div>

            {/* Reward badge */}
            <div className={`shrink-0 rounded-2xl border ${catStyle.bg} p-4 text-center shadow-xl ${catStyle.glow}`}>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Reward</p>
              <p className={`text-3xl font-black ${catStyle.text}`}>৳{Math.floor(reward / 10)}</p>
              <p className="text-xs text-slate-500">{reward} pts</p>
            </div>
          </div>
        </div>

        {/* Task details */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Description */}
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">
              <span className="h-4 w-0.5 rounded-full bg-brand-500" />
              About This Task
            </h2>
            <p className="whitespace-pre-wrap text-slate-300 leading-relaxed text-sm">{task.description}</p>
          </div>

          {/* Instructions */}
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">
              <span className="h-4 w-0.5 rounded-full bg-blue-500" />
              Step-by-Step Instructions
            </h2>
            <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-4">
              <p className="whitespace-pre-wrap text-slate-300 leading-relaxed text-sm">{task.instructions}</p>
            </div>
          </div>

          {/* Meta info row */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={14} className="text-slate-600" />
              <span>Expiry: <strong className="text-white">{task.expiryDate || 'Open'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Users size={14} className="text-slate-600" />
              <span>Spots: <strong className="text-white">{task.remainingParticipants ?? task.maxParticipants ?? '∞'}</strong></span>
            </div>
          </div>

          {/* Category selector / lock state */}
          <div className={`rounded-xl border ${catStyle.bg} p-5`}>
            {task.unlockedCategories?.length ? (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  <Zap size={14} className="inline mr-1 text-brand-400" />
                  Select Category to Submit
                </label>
                <div className="relative">
                  <select
                    className="field mt-0 appearance-none pr-10 bg-slate-900/70"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {task.unlockedCategories.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle size={15} className={catStyle.text} />
                  <span className={`text-sm font-bold ${catStyle.text}`}>
                    Reward for {category}: ৳{Math.floor(reward / 10)} ({reward} pts)
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-amber-400">
                <Lock size={20} />
                <div>
                  <p className="font-semibold">Category Not Unlocked</p>
                  <p className="text-xs text-amber-400/70 mt-0.5">Unlock a category to attempt this task.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* ── SUBMISSION FORM ── */}
      <form onSubmit={handleSubmit(submit)} className="card mt-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Upload size={16} className="text-brand-400" />
          </div>
          <div>
            <h2 className="font-bold text-white">Submit Screenshot Proof</h2>
            <p className="text-xs text-slate-500">Your proof stays private in the SocialEarn Drive folder.</p>
          </div>
        </div>

        {/* File upload area */}
        <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-white/15 bg-white/3 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all duration-200 px-6 py-8 cursor-pointer group">
          <div className="h-12 w-12 rounded-xl bg-white/8 group-hover:bg-brand-500/15 border border-white/10 flex items-center justify-center transition-all duration-200">
            <Upload size={22} className="text-slate-400 group-hover:text-brand-400 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
              Click to upload screenshot
            </p>
            <p className="text-xs text-slate-600 mt-1">JPG, PNG, WebP — max 5 MB</p>
          </div>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" {...register('screenshot')} />
        </label>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">
            <span>⚠️</span> {error}
          </div>
        )}
        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 py-2.5 text-sm text-brand-400">
            <span>✅</span> {message}
          </div>
        )}

        <button
          disabled={busy || !category}
          className="btn-primary mt-5 w-full flex items-center justify-center gap-2 py-3"
        >
          {busy ? (
            <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Uploading...</>
          ) : (
            <><Upload size={16} /> Submit for Review</>
          )}
        </button>
      </form>
    </div>
  );
}
