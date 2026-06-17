// LLM validation service tests
// Usage: node tests/llmValidation.test.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const llmValidation = require('../src/services/llmValidation.service');

function ok(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

async function run() {
  // 1. Empty content should be rejected without network call
  const empty = await llmValidation.validateArticle({ title: 'Title', content: '' });
  ok(empty.valid === false, 'Empty content is rejected');
  ok(empty.reason, 'Empty content returns a reason');

  // 2. Short content should be rejected without network call
  const short = await llmValidation.validateArticle({ title: 'Title', content: 'Too short.' });
  ok(short.valid === false, 'Short content is rejected');

  // 3. Gibberish should be rejected by pre-filter
  const gibberish = await llmValidation.validateArticle({ title: 'asdf', content: 'asdf asdf asdf qwer zxcv' });
  // If under 50 chars it hits pre-filter
  ok(gibberish.valid === false || gibberish.reason, 'Gibberish-like input is handled');

  // 4. Real valid article paragraph (skip if no key)
  if (!process.env.LLM_API_KEY || process.env.LLM_API_KEY.includes('your_')) {
    console.warn('SKIP: LLM_API_KEY not configured, skipping real LLM call test');
  } else {
    const validArticle = {
      title: 'Uganda Shilling Steady Against Dollar',
      content: 'The Uganda shilling held firm against the dollar on Tuesday as corporate exporters returned to the market to meet end-of-month obligations. Traders in Kampala reported balanced inflows and outflows, with the central bank remaining on the sidelines. Market watchers expect the currency to remain stable in the near term barring sharp moves in global commodity prices.',
    };
    const result = await llmValidation.validateArticle(validArticle);
    ok(result.valid === true, 'Valid article paragraph passes LLM validation');
  }

  console.log('\nAll LLM validation tests passed.');
}

run().catch((err) => {
  console.error('LLM validation test failed:', err.message);
  process.exit(1);
});
