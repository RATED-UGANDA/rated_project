import { useEffect, useState } from 'react';
import { getEditorQueue } from '../../api/articles';
import { Link } from 'react-router-dom';
import ArticleCard from '../../components/ArticleCard';

export default function QueuePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    try {
      const res = await getEditorQueue();
      setArticles(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading">Loading queue...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1 className="page-title">Editor Queue</h1>
      {articles.length === 0 ? (
        <div className="empty">No articles awaiting review.</div>
      ) : (
        <div className="grid grid-3">
          {articles.map((a) => (
            <div key={a.article_id} className="card">
              <ArticleCard article={a} />
              <div style={{ padding: '0 0.75rem 0.75rem' }}>
                {a.source_type === 'scraped' ? (
                  <span className="badge badge-source">Scraped from {a.source_name}</span>
                ) : (
                  <span className="badge badge-default">Staff</span>
                )}
                <Link to={`/editor/review/${a.article_id}`} className="btn btn-primary" style={{ marginLeft: '0.5rem' }}>Review</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
