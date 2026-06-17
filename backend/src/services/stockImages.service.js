const fetch = globalThis.fetch || require('node-fetch');
const pool = require('../config/db');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';
const SEARCH_TERMS = {
  Politics: 'Uganda parliament politics',
  Business: 'Uganda economy market',
  Sports: 'Uganda football sports',
  Technology: 'Africa technology office',
  Health: 'Uganda hospital health',
};

let warned = false;

function warnOnce() {
  if (!warned) {
    console.warn('[Stock Images] PEXELS_API_KEY not configured. Using placeholder fallback.');
    warned = true;
  }
}

async function refreshStockImagePool(categoryName) {
  if (!PEXELS_API_KEY) {
    warnOnce();
    return { refreshed: 0, errors: ['PEXELS_API_KEY not configured'] };
  }

  const [[category]] = await pool.execute('SELECT category_id FROM categories WHERE category_name = ?', [categoryName]);
  if (!category) {
    return { refreshed: 0, errors: [`Category ${categoryName} not found`] };
  }
  const categoryId = category.category_id;
  const term = SEARCH_TERMS[categoryName] || categoryName;

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(term)}&per_page=10`,
      {
        headers: { Authorization: PEXELS_API_KEY },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API returned ${response.status}`);
    }

    const json = await response.json();
    const photos = json.photos || [];

    await pool.execute('DELETE FROM stock_images WHERE category_id = ?', [categoryId]);

    let inserted = 0;
    for (const photo of photos) {
      if (!photo.src?.large) continue;
      await pool.execute(
        'INSERT INTO stock_images (category_id, image_url, thumbnail_url, credit_text, source_provider) VALUES (?, ?, ?, ?, ?)',
        [
          categoryId,
          photo.src.large,
          photo.src.medium || photo.src.small || photo.src.large,
          `Photo: ${photo.photographer} on Pexels`,
          'pexels',
        ]
      );
      inserted++;
    }

    return { refreshed: inserted, errors: [] };
  } catch (err) {
    return { refreshed: 0, errors: [err.message] };
  }
}

async function refreshAllCategories() {
  const [categories] = await pool.execute('SELECT category_name FROM categories');
  let total = 0;
  const errors = [];
  for (const cat of categories) {
    const result = await refreshStockImagePool(cat.category_name);
    total += result.refreshed;
    errors.push(...result.errors);
  }
  return { refreshed: total, errors };
}

async function getRandomStockImage(categoryId) {
  if (!categoryId) {
    return {
      image_url: '/assets/placeholder-cover.jpg',
      thumbnail_url: '/assets/placeholder-cover.jpg',
      credit_text: null,
    };
  }
  const [rows] = await pool.execute(
    'SELECT image_url, thumbnail_url, credit_text FROM stock_images WHERE category_id = ? ORDER BY RAND() LIMIT 1',
    [categoryId]
  );
  if (rows.length === 0) {
    return {
      image_url: '/assets/placeholder-cover.jpg',
      thumbnail_url: '/assets/placeholder-cover.jpg',
      credit_text: null,
    };
  }
  return rows[0];
}

module.exports = { refreshStockImagePool, refreshAllCategories, getRandomStockImage };
