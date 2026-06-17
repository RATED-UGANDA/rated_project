import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();

  return (
    <nav className="navbar">
      <div className="brand">
        <Link to="/">Rated Uganda</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {hasRole('journalist') && <Link to="/journalist">Journalist</Link>}
        {hasRole('editor') && <Link to="/editor">Editor</Link>}
        {(hasRole('administrator') || hasRole('super_admin')) && <Link to="/admin">Admin</Link>}
      </div>
      <div className="nav-user">
        {user ? (
          <>
            <span>{user.full_name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
