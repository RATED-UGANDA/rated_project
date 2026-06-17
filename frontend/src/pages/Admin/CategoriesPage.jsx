import { useEffect, useState } from 'react';
import { listCategories, createCategory } from '../../api/categories';
import AdminNav from '../../components/AdminNav';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category_name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await listCategories();
      setCategories(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createCategory(form);
      setForm({ category_name: '', description: '' });
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create category');
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <AdminNav />
      <h1 className="page-title">Categories</h1>
      {error && <div className="error">{error}</div>}
      <form className="form" onSubmit={handleSubmit}>
        <label>Category Name</label>
        <input type="text" required value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} />
        <label>Description</label>
        <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" className="btn btn-primary">Add Category</button>
      </form>

      <table className="table" style={{ marginTop: '1rem' }}>
        <thead>
          <tr><th>Name</th><th>Description</th></tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.category_id}>
              <td>{c.category_name}</td>
              <td>{c.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
