import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl, isPlaceholderUrl } from '../api/imageUtils';
import { apiOrigin } from '../api/client';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function categoryClass(name) {
  const map = { Politics: 'politics', Business: 'business', Sports: 'sports', Technology: 'technology', Health: 'health' };
  return map[name] || 'default';
}

export default function ArticleCard({ article, size = 'medium' }) {
  const [imgError, setImgError] = useState(false);
  const rawUrl = article.cover_image_url;
  let resolvedUrl = resolveImageUrl(rawUrl);
  if (resolvedUrl && resolvedUrl.startsWith('/')) {
    resolvedUrl = `${apiOrigin}${resolvedUrl}`;
  }
  const isPlaceholder = !resolvedUrl || isPlaceholderUrl(rawUrl) || imgError;


  const attribution = article.source_type === 'scraped'
    ? (article.source_name ? `Source: ${article.source_name}` : 'Scraped')
    : (article.journalist_name || 'Staff writer');

  return (
    <article className={`card card-${size}`}>
      {isPlaceholder ? (
        <div className="card-img-placeholder" style={{ backgroundColor: getCategoryColor(article.category_name) }}>
          {article.category_name || 'News'}
        </div>
      ) : (
        <img className="card-img" src={resolvedUrl} alt={article.title} loading="lazy" onError={() => setImgError(true)} />
      )}
      <div className="card-body">
        <div className="card-meta">
          {article.category_name && <span className={`badge badge-${categoryClass(article.category_name)}`}>{article.category_name}</span>}
          {article.source_type === 'scraped' && <span className="badge badge-source">Scraped</span>}
          <span>{formatDate(article.published_at || article.created_at)}</span>
        </div>
        <h3 className="card-title">
          <Link to={`/article/${article.article_id}`}>{article.title}</Link>
        </h3>
        <div className="card-meta">
          <span>{attribution}</span>
          {article.district_name && <span>• {article.district_name}</span>}
          {article.views !== undefined && <span>• {article.views} views</span>}
        </div>
      </div>
    </article>
  );
}

function getCategoryColor(name) {
  const colors = {
    Politics: '#fee2e2',
    Business: '#d1fae5',
    Sports: '#dbeafe',
    Technology: '#ede9fe',
    Health: '#cffafe',
  };
  return colors[name] || '#f3f4f6';
}
