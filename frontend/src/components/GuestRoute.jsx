import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects already-logged-in users away from /login and /signup
// to their appropriate dashboard so they don't see auth forms again
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}
