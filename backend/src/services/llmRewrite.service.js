const fetch = globalThis.fetch || require('node-fetch');

const LLM_API_URL = process.env.LLM_API_URL || 'https://api.ollama.com/api/chat';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-v4-flash';
const TIMEOUT_MS = 30000;

async function rewriteArticle({ title, summary, source_name }) {
  if (!title || !summary || summary.trim().split(/\s+/).length < 15) {
    return {
      title,
      content: `${summary || title}\n\nSource: ${source_name}.`,
    };
  }

  if (!LLM_API_KEY || !LLM_API_URL) {
    return {
      title,
      content: `${summary}\n\nSource: ${source_name}.`,
    };
  }

  const systemPrompt = `You are a news rewriter for a Ugandan news aggregation platform. Rewrite the following article into a short original news piece of 150-300 words, in your own words, based ONLY on the provided title and summary. Never invent names, numbers, quotes, or claims not present in the source summary. Always end the piece with a line crediting the original source by name.`;

  const userPrompt = `Source: ${source_name}\nTitle: ${title}\nSummary: ${summary}\n\nWrite a short news article.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
        options: { temperature: 0.7, num_predict: 500 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`LLM API returned ${response.status}`);
    }

    const json = await response.json();
    const content = json.message?.content || json.response || '';

    // Ensure source credit line exists
    const hasCredit = content.toLowerCase().includes('source:') || content.toLowerCase().includes(source_name.toLowerCase());
    const finalContent = hasCredit ? content : `${content.trim()}\n\nSource: ${source_name}.`;

    return { title, content: finalContent };
  } catch (err) {
    clearTimeout(timeout);
    console.error('[LLM Rewrite] fallback due to error:', err.message || err);
    return { title, content: `${summary}\n\nSource: ${source_name}.` };
  }
}

module.exports = { rewriteArticle };
