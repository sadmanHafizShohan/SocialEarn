import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Loader } from '../components/Loader';
import { Send, HeadphonesIcon, CheckCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

const SUPPORT_AVATAR = '🎧';

export default function Support() {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState('');
  const bottomRef = useRef(null);

  async function load() {
    try {
      const response = await api.get('/support/messages');
      setMessages(response.data?.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(event) {
    event.preventDefault();
    if (!message.trim()) return;
    setBusy(true); setError('');
    try {
      await api.post('/support/messages', { message });
      setMessage('');
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function formatTime(dateStr) {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }
  function formatDate(dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  if (loading) return <Loader className="py-24" label="Loading support..." />;

  const displayName = profile?.name || user?.displayName || 'You';

  return (
    <div className="mx-auto max-w-2xl flex flex-col" style={{ height: 'calc(100vh - 9rem)' }}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl
          bg-gradient-to-br from-violet-600/30 to-violet-500/10
          border border-violet-500/30 text-2xl">
          {SUPPORT_AVATAR}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Live Support
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 border border-green-500/30 px-2.5 py-0.5 text-xs font-semibold text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Online
            </span>
          </h1>
          <p className="text-sm text-slate-400">Private conversation with the SocialEarn team</p>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Chat area ────────────────────────────────────────────── */}
      <div className="card flex-1 overflow-y-auto chat-scroll min-h-0 space-y-4 pb-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="text-6xl mb-4 float">{SUPPORT_AVATAR}</div>
            <h3 className="font-bold text-slate-300">Start a conversation</h3>
            <p className="mt-2 text-sm text-slate-500">
              We're here to help. Send a message and we'll reply soon.
            </p>
          </div>
        ) : (
          <>
            {messages.map((item, idx) => {
              const isUser    = item.senderRole === 'user';
              const showDate  = idx === 0 || formatDate(item.createdAt) !== formatDate(messages[idx - 1]?.createdAt);

              return (
                <div key={item.messageId}>
                  {/* Date separator */}
                  {showDate && (
                    <div className="flex items-center gap-3 my-3">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-xs text-slate-500 font-medium px-2">
                        {formatDate(item.createdAt)}
                      </span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                  )}

                  <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {isUser ? (
                      <div className="shrink-0 mb-1">
                        <UserAvatar user={profile || user} size="xs" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 mb-1 items-center justify-center
                        rounded-full bg-violet-500/20 border border-violet-500/30 text-sm">
                        {SUPPORT_AVATAR}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-lg
                        ${isUser
                          ? 'rounded-br-sm bg-gradient-to-br from-brand-600 to-brand-700 text-white'
                          : 'rounded-bl-sm bg-white/8 border border-white/10 text-slate-200'
                        }`}
                    >
                      {/* Sender label (support only) */}
                      {!isUser && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">
                          Support Team
                        </p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.message}</p>
                      <div className={`mt-1.5 flex items-center gap-1.5 text-[10px]
                        ${isUser ? 'text-white/50 justify-end' : 'text-slate-500'}`}>
                        <Clock size={9} />
                        <time>{formatTime(item.createdAt)}</time>
                        {isUser && <CheckCheck size={11} className="text-brand-200" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* ── Input bar ────────────────────────────────────────────── */}
      <form onSubmit={send} className="mt-4 flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            className="field mt-0 min-h-[44px] max-h-32 resize-none py-3 pr-3 leading-relaxed"
            value={message}
            maxLength={2000}
            placeholder="Type a message…"
            rows={1}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim()) send(e);
              }
            }}
          />
          <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-600">
            {message.length}/2000
          </span>
        </div>
        <button
          disabled={busy || !message.trim()}
          className="btn-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-0"
          title="Send message"
        >
          {busy ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Send size={17} />
          )}
        </button>
      </form>
    </div>
  );
}
