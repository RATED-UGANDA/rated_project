import { Link, useLocation } from 'react-router-dom';

export default function AdminNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'btn-primary' : 'btn-secondary';

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <Link to="/admin" className={`btn ${isActive('/admin')}`}>Users</Link>
      <Link to="/admin/categories" className={`btn ${isActive('/admin/categories')}`}>Categories</Link>
      <Link to="/admin/districts" className={`btn ${isActive('/admin/districts')}`}>Districts</Link>
      <Link to="/admin/scraper" className={`btn ${isActive('/admin/scraper')}`}>Scraper & Images</Link>
    </div>
  );
}
