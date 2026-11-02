import { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader } from '../components/Loader';

export default function Support() {
  const [messages, setMessages] = useState([]); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function load() { try { const response = await api.get('/support/messages'); setMessages(response.data?.items || []); } catch (e) { setError(e.message); } finally { setLoading(false); } }
  useEffect(() => { load(); const timer = window.setInterval(load, 5000); return () => window.clearInterval(timer); }, []);
  async function send(event) { event.preventDefault(); if (!message.trim()) return; setBusy(true); setError(''); try { await api.post('/support/messages', { message }); setMessage(''); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  if (loading) return <Loader className="py-16" label="Loading support..." />;
  return <div className="mx-auto max-w-2xl"><h1 className="text-3xl font-bold">Live support</h1><p className="mt-2 text-slate-600">This is your private conversation with the SocialEarn support team.</p>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="card mt-6 min-h-96 space-y-3">{messages.length ? messages.map((item) => <div key={item.messageId} className={`max-w-[85%] rounded-2xl p-3 text-sm ${item.senderRole === 'user' ? 'ml-auto bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}><p>{item.message}</p><time className="mt-1 block text-xs opacity-70">{new Date(item.createdAt).toLocaleString()}</time></div>) : <p className="text-sm text-slate-500">Send a message to start a conversation.</p>}</div><form onSubmit={send} className="mt-4 flex gap-2"><input className="field mt-0" value={message} maxLength="2000" placeholder="Write your message..." onChange={(e) => setMessage(e.target.value)} /><button disabled={busy} className="btn-primary shrink-0">{busy ? 'Sending...' : 'Send'}</button></form></div>;
}
