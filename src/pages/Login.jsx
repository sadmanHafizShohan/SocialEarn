import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, LockKeyhole, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, configured, login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('login'); const [form, setForm] = useState({ email: '', password: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); try { await (mode === 'login' ? login : register)(form.email, form.password); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  if (!configured) return <div className="flex min-h-screen items-center justify-center p-4"><div className="card max-w-lg"><h1 className="text-2xl font-bold">Configure Firebase to continue</h1><p className="mt-3 text-slate-600">Copy <code>.env.example</code> to <code>.env.local</code>, add your Firebase web app values, and restart Vite.</p></div></div>;
  return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4"><div className="card w-full max-w-md"><div className="mb-8 text-center"><div className="text-3xl font-black text-brand-600">SocialEarn</div><p className="mt-2 text-slate-500">Earn transparently from permitted activities.</p></div>
    <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Email<div className="relative"><Mail className="absolute left-3 top-3 text-slate-400" size={18} /><input className="field pl-10" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></label><label className="block text-sm font-medium">Password<div className="relative"><LockKeyhole className="absolute left-3 top-3 text-slate-400" size={18} /><input className="field pl-10" type="password" minLength="6" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div></label>{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={busy} className="btn-primary w-full">{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form>
    <button className="btn-secondary mt-3 flex w-full items-center justify-center gap-2" onClick={() => loginWithGoogle().catch((e) => setError(e.message))}><Chrome size={18} /> Continue with Google</button><button className="mt-5 w-full text-sm text-brand-700" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}</button>
  </div></main>;
}
