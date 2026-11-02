import { Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader } from '../components/Loader';
import UserAvatar from '../components/UserAvatar';

const tabs = ['overview', 'tasks', 'unlocks', 'submissions', 'support', 'withdrawals', 'transactions', 'users', 'settings', 'logs'];
const emptyTask = { title: '', description: '', platform: '', category: [], points: 150, instructions: '', maxParticipants: 100, startDate: '', expiryDate: '', status: 'active' };

function AdminHome() {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [task, setTask] = useState(emptyTask);
  const [items, setItems] = useState({});
  const [preview, setPreview] = useState(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [previewBusy, setPreviewBusy] = useState(false);

  async function load() {
    setError('');
    try {
      const [dashboard, tasks, submissions, withdrawals, users, settings, logs, unlocks, support, transactions] = await Promise.all([
        api.get('/admin/dashboard'), api.get('/admin/tasks'), api.get('/admin/submissions'),
        api.get('/admin/withdrawals'), api.get('/admin/users'), api.get('/admin/settings'), api.get('/admin/logs'), api.get('/admin/unlocks'), api.get('/support/messages'), api.get('/admin/transactions')
      ]);
      setData(dashboard.data || {});
      setItems({ tasks: tasks.data?.items || [], submissions: submissions.data?.items || [], withdrawals: withdrawals.data?.items || [], users: users.data?.items || [], settings: settings.data?.items || [], logs: logs.data?.items || [], unlocks: unlocks.data?.items || [], support: support.data?.items || [], transactions: transactions.data?.items || [] });
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function action(method, url, body) {
    setError(''); setMessage(''); setBusy(true);
    try { await api({ method, url, data: body }); setMessage('Saved successfully.'); await load(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function createTask(event) {
    event.preventDefault();
    await action('post', '/admin/tasks', { ...task, maxParticipants: Number(task.maxParticipants) });
    setTask(emptyTask);
  }
  const list = (key) => items[key] || [];
  return <div>
    <h1 className="text-3xl font-bold">Admin workspace</h1>
    <div className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-1">{tabs.map((name) => <button key={name} onClick={() => setTab(name)} className={`shrink-0 rounded-xl px-3 py-2 text-sm capitalize ${tab === name ? 'bg-brand-600 text-white' : 'bg-white text-slate-600'}`}>{name}</button>)}</div>
    {error && <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {message && <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">{message}</div>}
    {loading && <Loader className="py-12" label="Loading admin data..." />}
    {!loading && busy && <Loader className="mt-4" label="Saving changes..." />}
    {previewBusy && <Loader className="mt-4" label="Loading proof..." />}
    {!loading && <div>
    {tab === 'overview' && <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Users', data.totalUsers], ['Active tasks', data.activeTasks], ['Pending reviews', data.pendingSubmissions], ['Pending withdrawals', data.pendingWithdrawals], ['Approved submissions', data.approvedSubmissions], ['Paid withdrawals', data.paidWithdrawals], ['Points issued', data.totalPointsIssued], ['Paid amount', `৳${Math.floor(Number(data.totalPaidAmountPaisa || 0) / 100)}`]].map(([label, value]) => <div className="card" key={label}><p className="text-sm text-slate-500">{label}</p><b className="mt-2 block text-2xl">{value ?? '—'}</b></div>)}</div>}
    {tab === 'tasks' && <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]"><form className="card space-y-3" onSubmit={createTask}><h2 className="font-bold">Create task</h2>{[['title', 'Title'], ['description', 'Description'], ['platform', 'Platform'], ['instructions', 'Instructions']].map(([key, label]) => <label className="block text-sm" key={key}>{label}<textarea className="field" rows={key === 'title' ? 1 : 2} value={task[key]} onChange={(e) => setTask({ ...task, [key]: e.target.value })} required={key === 'title'} /></label>)}<fieldset className="text-sm"><legend className="font-medium">Categories</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{['Basic', 'Standard', 'Premium'].map((category) => <label className="flex items-center gap-2" key={category}><input type="checkbox" checked={task.category.includes(category)} onChange={(e) => setTask({ ...task, category: e.target.checked ? [...task.category, category] : task.category.filter((item) => item !== category) })} />{category} ({ { Basic: 15, Standard: 35, Premium: 60 }[category] } taka)</label>)}</div></fieldset><p className="text-sm text-slate-500">Users receive the displayed taka amount based on the category they select.</p><label className="block text-sm">Participants<input className="field" type="number" min="1" value={task.maxParticipants} onChange={(e) => setTask({ ...task, maxParticipants: e.target.value })} /></label><button className="btn-primary" disabled={!task.category.length}>Create task</button></form><section className="card"><h2 className="font-bold">Task management</h2>{list('tasks').map((item) => <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3 text-sm" key={item.taskId}><span><b>{item.title}</b><br /><span className="text-slate-500">{Array.isArray(item.category) ? item.category.join(', ') : item.category} · {item.status}</span></span>{item.status !== 'archived' && <div className="flex gap-3"><button className="text-brand-600" onClick={() => action('patch', `/admin/tasks/${item.taskId}`, { ...item, status: item.status === 'active' ? 'paused' : 'active' })}>{item.status === 'active' ? 'Pause' : 'Activate'}</button><button className="text-red-600" onClick={() => action('delete', `/admin/tasks/${item.taskId}`)}>Archive</button></div>}</div>)}</section></div>}
    {tab === 'unlocks' && <UnlockList items={list('unlocks')} onAction={(item, status) => action('patch', `/admin/unlocks/${item.requestId}`, { status, adminNote: window.prompt('Admin note') || '' })} onPreview={async (id) => { setPreviewBusy(true); try { const result = await api.get(`/admin/unlocks/${id}/screenshot`); setPreview(`data:${result.data.mimeType};base64,${result.data.content}`); } catch (e) { setError(e.message); } finally { setPreviewBusy(false); } }} />}
    {tab === 'support' && <SupportAdmin items={list('support')} onSent={load} />}
    {tab === 'submissions' && <><ReviewList items={list('submissions')} onPreview={async (id) => { setPreviewBusy(true); setError(''); try { const result = await api.get(`/admin/submissions/${id}/screenshot`); setPreview(`data:${result.data.mimeType};base64,${result.data.content}`); } catch (e) { setError(e.message); } finally { setPreviewBusy(false); } }} onAction={(item, status) => action('patch', `/admin/submissions/${item.submissionId}/review`, { status, rejectionReason: status === 'rejected' ? (window.prompt('Rejection reason') || 'Not approved') : '' })} />{preview && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}><img className="max-h-[90vh] max-w-[90vw] rounded-xl bg-white object-contain p-2" src={preview} alt="Submission proof" /></div>}</>}
    {tab === 'withdrawals' && <WithdrawalList items={list('withdrawals')} onAction={(item, status) => action('patch', `/admin/withdrawals/${item.withdrawalId}/review`, { status, adminNote: window.prompt('Admin note') || '', paymentReference: status === 'paid' ? (window.prompt('Payment reference') || '') : '' })} />}
    {tab === 'transactions' && <SimpleList items={list('transactions')} fields={['userEmail', 'type', 'points', 'description', 'createdAt']} />}
    {tab === 'users' && <UserList items={list('users')} onAction={(id, status) => action('patch', `/admin/users/${id}/status`, { status })} />}
    {tab === 'settings' && <SettingsList items={list('settings')} onAction={(key, value) => action('patch', '/admin/settings', { settingKey: key, settingValue: value })} />}
    {tab === 'logs' && <SimpleList items={list('logs')} fields={['action', 'targetType', 'targetId', 'createdAt']} />}
    </div>}</div>;
}

function ReviewList({ items, onAction, onPreview }) { return <SimpleList items={items} fields={['userEmail', 'taskTitle', 'status', 'pointsSnapshot', 'createdAt']} actions={(item) => <>{onPreview && <button className="mr-3 text-brand-600" onClick={() => onPreview(item.submissionId)}>View proof</button>}{item.status === 'pending' && <><button className="text-green-600" onClick={() => onAction(item, 'approved')}>Approve</button><button className="ml-3 text-red-600" onClick={() => onAction(item, 'rejected')}>Reject</button></>}</>} />; }
function WithdrawalList({ items, onAction }) { return <SimpleList items={items} fields={['userEmail', 'points', 'amountPaisa', 'paymentMethod', 'accountNumber', 'status']} actions={(item) => item.status === 'pending' && <><button className="text-green-600" onClick={() => onAction(item, 'paid')}>Mark paid</button><button className="ml-3 text-red-600" onClick={() => onAction(item, 'rejected')}>Reject</button></>} />; }
function UserList({ items, onAction }) { return <div className="card mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['User', 'Email', 'Role', 'Status', 'Actions'].map((field) => <th className="border-b p-3" key={field}>{field}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.userId}><td className="border-b p-3"><div className="flex items-center gap-2"><UserAvatar user={item} size="sm" /><span>{item.name || 'Unknown user'}</span></div></td><td className="border-b p-3">{item.email}</td><td className="border-b p-3">{item.role}</td><td className="border-b p-3">{item.status}</td><td className="border-b p-3">{item.role !== 'admin' && <button className="text-red-600" onClick={() => onAction(item.userId, item.status === 'blocked' ? 'active' : 'blocked')}>{item.status === 'blocked' ? 'Unblock' : 'Block'}</button>}</td></tr>)}</tbody></table>{!items.length && <p className="p-4 text-sm text-slate-500">No records found.</p>}</div>; }
function UnlockList({ items, onAction, onPreview }) { return <SimpleList items={items} fields={['userEmail', 'category', 'amountTaka', 'paymentMethod', 'phoneNumber', 'transactionId', 'status']} actions={(item) => <>{onPreview && <button className="mr-3 text-brand-600" onClick={() => onPreview(item.requestId)}>View proof</button>}{item.status === 'pending' && <><button className="text-green-600" onClick={() => onAction(item, 'approved')}>Approve</button><button className="ml-3 text-red-600" onClick={() => onAction(item, 'rejected')}>Reject</button></>}</>} />; }
function SupportAdmin({ items, onSent }) { const [drafts, setDrafts] = useState({}); async function send(userId) { const message = String(drafts[userId] || '').trim(); if (!message) return; await api.post('/support/messages', { userId, message }); setDrafts({ ...drafts, [userId]: '' }); onSent(); } const users = [...new Map(items.map((item) => [item.userId, item])).values()]; return <div className="card mt-6 space-y-6">{users.length ? users.map((user) => <div key={user.userId} className="border-b pb-5"><div className="flex items-center gap-2"><UserAvatar user={user} size="sm" /><div><p className="font-semibold">{user.userName || user.userEmail || 'Unknown user'}</p><p className="text-xs text-slate-500">{user.userEmail ? 'Private support conversation' : 'User email unavailable'}</p></div></div>{items.filter((item) => item.userId === user.userId).slice(-5).map((item) => <p key={item.messageId} className="mt-2 text-sm"><b>{item.senderRole}:</b> {item.message}</p>)}<div className="mt-3 flex gap-2"><input className="field mt-0" value={drafts[user.userId] || ''} onChange={(e) => setDrafts({ ...drafts, [user.userId]: e.target.value })} placeholder="Reply..." /><button className="btn-primary shrink-0" onClick={() => send(user.userId)}>Send</button></div></div>) : <p className="text-sm text-slate-500">No support conversations yet.</p>}</div>; }
function SettingsList({ items, onAction }) { return <div className="card mt-6">{items.map((item) => <div className="flex flex-col gap-2 border-b py-3 sm:flex-row sm:items-center" key={item.settingKey}><span className="break-all text-sm sm:w-56">{item.settingKey}</span><input className="field" defaultValue={item.settingValue} onBlur={(e) => onAction(item.settingKey, e.target.value)} /></div>)}</div>; }
function SimpleList({ items, fields, actions }) { return <div className="card mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{fields.map((field) => <th className="border-b p-3 capitalize" key={field}>{field}</th>)}{actions && <th className="border-b p-3">Actions</th>}</tr></thead><tbody>{items.map((item) => <tr key={item.submissionId || item.withdrawalId || item.userId || item.logId}>{fields.map((field) => <td className="border-b p-3" key={field}>{String(item[field] ?? '')}</td>)}{actions && <td className="border-b p-3">{actions(item)}</td>}</tr>)}</tbody></table>{!items.length && <p className="p-4 text-sm text-slate-500">No records found.</p>}</div>; }

export default function Admin() { return <Routes><Route index element={<AdminHome />} /><Route path="*" element={<AdminHome />} /></Routes>; }
