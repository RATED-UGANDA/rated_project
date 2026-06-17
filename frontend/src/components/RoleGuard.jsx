import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleGuard({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const allowed = Array.isArray(roles) ? roles : [roles];
  const hasRole = allowed.some((r) => user.roles.includes(r));

  if (!hasRole) {
    return (
      <div className="error-page">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <a href="/">Go home</a>
      </div>
    );
  }

  return children;
}
