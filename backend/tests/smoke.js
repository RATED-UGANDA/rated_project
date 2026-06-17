// End-to-end smoke test for Rated Uganda backend
// Usage: node tests/smoke.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE = process.env.API_BASE || 'http://localhost:5000/api';
const mysql = require('mysql2/promise');

function ok(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

async function resetDb() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2512',
    database: process.env.DB_NAME || 'ratedug',
    multipleStatements: true,
  });
  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '../db/seed.sql'), 'utf8');
  await pool.query(schema);
  await pool.query(seed);
  await pool.end();
  console.log('Database reset');
}

async function run() {
  console.log(`Smoke testing ${BASE}\n`);
  await resetDb();

  // 1. Health check
  const health = await axios.get(`${BASE}/health`);
  ok(health.status === 200, 'Health endpoint returns 200');
  ok(health.data.status === 'success', 'Health status is success');

  // 2. Login as seeded admin
  const adminLogin = await axios.post(`${BASE}/auth/login`, {
    email: 'admin@rateduganda.ug',
    password: 'Admin123!',
  });
  ok(adminLogin.status === 200, 'Admin login succeeds');
  const adminToken = adminLogin.data.data.token;
  ok(adminToken, 'Admin token received');
  ok(adminLogin.data.data.user.roles.includes('super_admin'), 'Admin has super_admin role');

  // 3. Create category as admin
  const cat = await axios.post(
    `${BASE}/categories`,
    { category_name: 'Education', description: 'Schools and learning' },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  ok(cat.status === 201, 'Admin creates category');
  const categoryId = cat.data.data.category_id;

  // 4. Create district as admin
  const dist = await axios.post(
    `${BASE}/districts`,
    { district_name: 'Gulu', region: 'Northern' },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  ok(dist.status === 201, 'Admin creates district');
  const districtId = dist.data.data.district_id;

  // 5. Register and approve a journalist
  const reg = await axios.post(`${BASE}/auth/register`, {
    full_name: 'Test Journalist',
    email: 'test.journalist@rateduganda.ug',
    password: 'TestPass123!',
  });
  ok(reg.status === 201, 'New user registers');
  const newUserId = (await axios.get(`${BASE}/admin/users`, { headers: { Authorization: `Bearer ${adminToken}` } })).data.data.find(u => u.email === 'test.journalist@rateduganda.ug').user_id;

  await axios.patch(`${BASE}/admin/users/${newUserId}/approve`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
  const roleAssign = await axios.patch(
    `${BASE}/admin/users/${newUserId}/roles`,
    { role_name: 'journalist' },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  ok(roleAssign.status === 200, 'Admin assigns journalist role');

  // Assert subtype row exists
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2512',
    database: process.env.DB_NAME || 'ratedug',
  });
  const [[journalistRow]] = await pool.execute('SELECT * FROM journalists WHERE user_id = ?', [newUserId]);
  ok(!!journalistRow, 'Journalist subtype row created for user');
  await pool.end();

  // 6. Login as journalist
  const journoLogin = await axios.post(`${BASE}/auth/login`, {
    email: 'test.journalist@rateduganda.ug',
    password: 'TestPass123!',
  });
  ok(journoLogin.status === 200, 'Journalist login succeeds');
  const journoToken = journoLogin.data.data.token;

  // 7. Create article
  const article = await axios.post(
    `${BASE}/articles`,
    {
      title: 'Gulu Schools Receive New Science Kits',
      content: 'Education officials in Gulu district have distributed new science kits to ten secondary schools ahead of the new term. Teachers welcomed the support, noting that practical experiments had been limited by shortages of basic equipment. The district education officer said the kits are part of a broader effort to improve STEM outcomes in northern Uganda.',
      category_id: categoryId,
      district_id: districtId,
    },
    { headers: { Authorization: `Bearer ${journoToken}` } }
  );
  ok(article.status === 201, 'Journalist creates article');
  const articleId = article.data.data.article_id;
  ok(article.data.data.status === 'draft', 'Article starts as draft');

  // 8. Submit article (LLM stub will pass it)
  const submit = await axios.post(
    `${BASE}/articles/${articleId}/submit`,
    {},
    { headers: { Authorization: `Bearer ${journoToken}` } }
  );
  ok(submit.status === 200, 'Article submitted');
  ok(submit.data.data.status === 'pending_review', 'Article is pending_review');
  ok(submit.data.data.llm_checked === 1, 'Article is llm_checked');

  // 9. Login as editor
  const editorLogin = await axios.post(`${BASE}/auth/login`, {
    email: 'demo.editor@rateduganda.ug',
    password: 'EditorPass123!',
  });
  ok(editorLogin.status === 200, 'Editor login succeeds');
  const editorToken = editorLogin.data.data.token;

  // 10. Editor queue
  const queue = await axios.get(`${BASE}/articles/queue/editor`, {
    headers: { Authorization: `Bearer ${editorToken}` },
  });
  ok(queue.status === 200, 'Editor queue loads');
  ok(queue.data.data.some((a) => a.article_id === articleId), 'Submitted article is in editor queue');

  // 11. Approve article
  const review = await axios.post(
    `${BASE}/articles/${articleId}/review`,
    { decision: 'approve', feedback: 'Looks good' },
    { headers: { Authorization: `Bearer ${editorToken}` } }
  );
  ok(review.status === 200, 'Editor approves article');
  ok(review.data.data.status === 'published', 'Article is published');

  // 12. Public fetch
  const pub = await axios.get(`${BASE}/articles/${articleId}`);
  ok(pub.status === 200, 'Public can fetch published article');
  ok(pub.data.data.status === 'published', 'Public article is published');

  // 13. Article list
  const list = await axios.get(`${BASE}/articles`);
  ok(list.status === 200, 'Article list loads');
  ok(list.data.data.articles.length >= 1, 'List contains articles');

  // 14. View tracking
  const view = await axios.post(`${BASE}/articles/${articleId}/views`);
  ok(view.status === 200, 'View tracking works');

  // 15. Role boundary: reader cannot create article
  const readerReg = await axios.post(`${BASE}/auth/register`, {
    full_name: 'Test Reader',
    email: 'test.reader@rateduganda.ug',
    password: 'TestPass123!',
  });
  ok(readerReg.status === 201, 'Reader registers');
  const readerLogin = await axios.post(`${BASE}/auth/login`, {
    email: 'test.reader@rateduganda.ug',
    password: 'TestPass123!',
  });
  const readerToken = readerLogin.data.data.token;
  try {
    await axios.post(
      `${BASE}/articles`,
      { title: 'x', content: 'y' },
      { headers: { Authorization: `Bearer ${readerToken}` } }
    );
    ok(false, 'Reader should not create article');
  } catch (err) {
    ok(err.response.status === 403, 'Reader article creation is forbidden');
  }

  console.log('\nAll smoke tests passed.');
}

run().catch((err) => {
  console.error('Smoke test failed:', err.response ? err.response.data : err.message);
  process.exit(1);
});
