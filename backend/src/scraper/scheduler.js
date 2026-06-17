const { runScrapeCycle } = require('./scrapeRunner');
const { refreshAllCategories } = require('../services/stockImages.service');

let scrapeInterval;
let imageInterval;

function startScheduler() {
  const scrapeMinutes = parseInt(process.env.SCRAPE_INTERVAL_MINUTES, 10) || 60;
  const imageHours = parseInt(process.env.IMAGE_REFRESH_HOURS, 10) || 24;

  scrapeInterval = setInterval(async () => {
    try {
      const summary = await runScrapeCycle();
      console.log('[Scheduler] scrape cycle:', summary);
    } catch (err) {
      console.error('[Scheduler] scrape cycle error:', err.message);
    }
  }, scrapeMinutes * 60 * 1000);

  imageInterval = setInterval(async () => {
    try {
      const summary = await refreshAllCategories();
      console.log('[Scheduler] image refresh:', summary);
    } catch (err) {
      console.error('[Scheduler] image refresh error:', err.message);
    }
  }, imageHours * 60 * 60 * 1000);
}

module.exports = { startScheduler };
