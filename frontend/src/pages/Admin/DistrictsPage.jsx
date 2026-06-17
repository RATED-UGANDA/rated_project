import { useEffect, useState } from 'react';
import { listDistricts, createDistrict } from '../../api/categories';
import AdminNav from '../../components/AdminNav';

export default function DistrictsPage() {
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState({ district_name: '', region: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDistricts();
  }, []);

  async function loadDistricts() {
    try {
      const res = await listDistricts();
      setDistricts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load districts');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createDistrict(form);
      setForm({ district_name: '', region: '' });
      loadDistricts();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create district');
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <AdminNav />
      <h1 className="page-title">Districts</h1>
      {error && <div className="error">{error}</div>}
      <form className="form" onSubmit={handleSubmit}>
        <label>District Name</label>
        <input type="text" required value={form.district_name} onChange={(e) => setForm({ ...form, district_name: e.target.value })} />
        <label>Region</label>
        <input type="text" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
        <button type="submit" className="btn btn-primary">Add District</button>
      </form>

      <table className="table" style={{ marginTop: '1rem' }}>
        <thead>
          <tr><th>Name</th><th>Region</th></tr>
        </thead>
        <tbody>
          {districts.map((d) => (
            <tr key={d.district_id}>
              <td>{d.district_name}</td>
              <td>{d.region || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
