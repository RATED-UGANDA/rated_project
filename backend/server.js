require('dotenv').config();
const app = require('./src/app');
const { startScheduler } = require('./src/scraper/scheduler');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Rated Uganda backend running on http://localhost:${PORT}`);
  startScheduler();
});
