const scrapedSourceModel = require('../models/scrapedSource.model');
const { runScrapeCycle } = require('../scraper/scrapeRunner');
const { refreshAllCategories } = require('../services/stockImages.service');

async function listSources(req, res, next) {
  try {
    const sources = await scrapedSourceModel.findAll();
    res.json({ data: sources });
  } catch (err) {
    next(err);
  }
}

async function createSource(req, res, next) {
  try {
    const [result] = await require('../config/db').execute(
      'INSERT INTO scraped_sources (source_name, feed_url, site_url, is_active) VALUES (?, ?, ?, ?)',
      [req.body.source_name, req.body.feed_url, req.body.site_url || null, req.body.is_active !== false]
    );
    const source = await scrapedSourceModel.findAll().then((all) => all.find((s) => s.source_id === result.insertId));
    res.status(201).json({ data: source });
  } catch (err) {
    next(err);
  }
}

async function updateSource(req, res, next) {
  try {
    await scrapedSourceModel.update(req.params.id, { is_active: req.body.is_active });
    const sources = await scrapedSourceModel.findAll();
    const source = sources.find((s) => s.source_id === parseInt(req.params.id, 10));
    res.json({ data: source });
  } catch (err) {
    next(err);
  }
}

async function runScraper(req, res, next) {
  try {
    const summary = await runScrapeCycle();
    res.json({ data: summary });
  } catch (err) {
    next(err);
  }
}

async function getLastRun(req, res, next) {
  try {
    const last = await scrapedSourceModel.getLastRunSummary();
    res.json({ data: last || { message: 'No scraper runs yet' } });
  } catch (err) {
    next(err);
  }
}

async function refreshImages(req, res, next) {
  try {
    const summary = await refreshAllCategories();
    res.json({ data: summary });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listSources,
  createSource,
  updateSource,
  runScraper,
  getLastRun,
  refreshImages,
};
