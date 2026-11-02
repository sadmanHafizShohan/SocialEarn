import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';
import { Loader } from './components/Loader';
import Unlocks from './pages/Unlocks';
import Support from './pages/Support';
import Referral from './pages/Referral';

function Home() {
  const { profile, loading } = useAuth();
  if (loading || !profile) return <Loader className="min-h-screen" label="Loading SocialEarn..." />;
  return profile.role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />;
}

function AdminOnly() {
  const { profile, loading } = useAuth();
  if (loading) return <Loader className="min-h-screen" label="Loading SocialEarn..." />;
  return profile?.role === 'admin' ? <Admin /> : <Navigate to="/" replace />;
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader className="min-h-screen" label="Loading SocialEarn..." />;
  return user ? children : <Navigate to="/login" replace />;
}
export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<Protected><Layout /></Protected>}>
      <Route index element={<Home />} /><Route path="/tasks" element={<Tasks />} />
      <Route path="/tasks/:taskId" element={<TaskDetails />} /><Route path="/wallet" element={<Wallet />} />
      <Route path="/unlocks" element={<Unlocks />} /><Route path="/support" element={<Support />} />
      <Route path="/referral" element={<Referral />} />
      <Route path="/admin/*" element={<AdminOnly />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
