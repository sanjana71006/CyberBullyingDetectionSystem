import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
