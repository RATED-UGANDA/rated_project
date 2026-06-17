import { useEffect, useState } from 'react';
import { listArticles } from '../../api/articles';
import { listCategories, listDistricts } from '../../api/categories';
import ArticleCard from '../../components/ArticleCard';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', district: '', search: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [articlesRes, catsRes, distRes] = await Promise.all([
        listArticles(),
        listCategories(),
        listDistricts(),
      ]);
      setArticles(articlesRes.data.data.articles);
      setCategories(catsRes.data.data);
      setDistricts(distRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load homepage');
    } finally {
      setLoading(false);
    }
  }

  async function applyFilters(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await listArticles(filters);
      setArticles(res.data.data.articles);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to filter articles');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading">Loading news...</div>;
  if (error) return <div className="error">{error}</div>;

  const isFiltering = filters.category || filters.district || filters.search;
  const hero = articles[0];
  const grid = articles.slice(1, 5);
  const sidebar = articles.slice(1, 8);
  const featured = articles.slice(8, 11);

  const districtCounts = districts.map((d) => ({
    ...d,
    count: articles.filter((a) => a.district_name === d.district_name).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="container">
      <form className="filters" onSubmit={applyFilters}>
        <input
          type="text"
          placeholder="Search articles..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
        </select>
        <select value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })}>
          <option value="">All Districts</option>
          {districts.map((d) => <option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Filter</button>
        {isFiltering && <button type="button" className="btn btn-secondary" onClick={() => { setFilters({ category: '', district: '', search: '' }); loadData(); }}>Clear</button>}
      </form>

      {articles.length === 0 ? (
        <div className="empty">No published articles yet.</div>
      ) : isFiltering ? (
        <div className="grid grid-3">
          {articles.map((a) => <ArticleCard key={a.article_id} article={a} />)}
        </div>
      ) : (
        <>
          <section className="hero">
            <div className="hero-main">
              {hero && <ArticleCard article={hero} size="hero" />}
            </div>
            <aside className="sidebar">
              <h3>Latest Updates</h3>
              <ul className="sidebar-list">
                {sidebar.map((a) => (
                  <li key={a.article_id}>
                    <a href={`/article/${a.article_id}`}>{a.title}</a>
                    <div className="card-meta">{new Date(a.published_at || a.created_at).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>

              <h3 style={{ marginTop: '1rem' }}>Popular Districts</h3>
              <ul className="sidebar-list">
                {districtCounts.slice(0, 5).map((d) => (
                  <li key={d.district_id}>
                    {d.district_name} <span className="card-meta">({d.count} articles)</span>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <section className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
            {grid.map((a) => <ArticleCard key={a.article_id} article={a} />)}
          </section>

          <section>
            <h2 style={{ marginBottom: '0.75rem' }}>Featured Articles</h2>
            <div className="grid grid-3">
              {featured.length > 0 ? featured.map((a) => <ArticleCard key={a.article_id} article={a} />) : (
                <div className="empty">No more articles.</div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
