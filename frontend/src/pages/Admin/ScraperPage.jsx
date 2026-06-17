import { useEffect, useState } from 'react';
import { listSources, updateSource, runScraper, getLastRun, refreshImages } from '../../api/admin';
import AdminNav from '../../components/AdminNav';

export default function ScraperPage() {
  const [sources, setSources] = useState([]);
  const [lastRun, setLastRun] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sourcesRes, lastRes] = await Promise.all([listSources(), getLastRun()]);
      setSources(sourcesRes.data.data);
      setLastRun(lastRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load scraper data');
    } finally {
      setLoading(false);
    }
  }

  async function toggleSource(id, current) {
    try {
      await updateSource(id, !current);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Toggle failed');
    }
  }

  async function handleRun() {
    setRunResult(null);
    try {
      const res = await runScraper();
      setRunResult(res.data.data);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Scraper run failed');
    }
  }

  async function handleRefreshImages() {
    setImageResult(null);
    try {
      const res = await refreshImages();
      setImageResult(res.data.data);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Image refresh failed');
    }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <AdminNav />
      <h1 className="page-title">Scraper & Images</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={handleRun}>Run Scrape Now</button>
        <button className="btn btn-secondary" onClick={handleRefreshImages}>Refresh Stock Images</button>
      </div>

      {runResult && (
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <strong>Last Run Result:</strong> Fetched {runResult.fetched}, Inserted {runResult.inserted}, Skipped {runResult.skipped}.
          {runResult.errors?.length > 0 && <div className="error">Errors: {runResult.errors.map((e) => e.error || e).join(', ')}</div>}
        </div>
      )}

      {imageResult && (
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <strong>Image Refresh:</strong> Refreshed {imageResult.refreshed} images.
          {imageResult.errors?.length > 0 && <div className="error">Errors: {imageResult.errors.join(', ')}</div>}
        </div>
      )}

      {lastRun && lastRun.last_scraped_at && (
        <p className="card-meta">Last scraped: {new Date(lastRun.last_scraped_at).toLocaleString()} ({lastRun.source_name})</p>
      )}

      <h2>Sources</h2>
      <table className="table">
        <thead>
          <tr><th>Source</th><th>Feed URL</th><th>Status</th><th>Notes</th><th>Action</th></tr>
        </thead>
        <tbody>
          {sources.map((s) => (
            <tr key={s.source_id}>
              <td>{s.source_name}</td>
              <td style={{ maxWidth: '300px', wordBreak: 'break-all' }}>{s.feed_url}</td>
              <td>{s.is_active ? 'Active' : 'Inactive'}</td>
              <td>{s.notes || '-'}</td>
              <td>
                <button className="btn btn-secondary" onClick={() => toggleSource(s.source_id, s.is_active)}>
                  {s.is_active ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
