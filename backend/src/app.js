const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const authMeRoutes = require('./routes/authMe.routes');
const articleRoutes = require('./routes/article.routes');
const categoryRoutes = require('./routes/category.routes');
const districtRoutes = require('./routes/district.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');
const scraperRoutes = require('./routes/scraper.routes');
const imageRoutes = require('./routes/image.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const staticCors = (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
};

app.use('/uploads', staticCors, express.static(path.join(__dirname, '../uploads')));
app.use('/assets', staticCors, express.static(path.join(__dirname, './assets')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Rated Uganda API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', authMeRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/scraper', scraperRoutes);
app.use('/api/admin/images', imageRoutes);

app.use(errorHandler);

module.exports = app;
