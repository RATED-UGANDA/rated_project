const fetch = globalThis.fetch || require('node-fetch');

const LLM_API_URL = process.env.LLM_API_URL || 'https://api.ollama.com/api/chat';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-v4-flash';
const TIMEOUT_MS = 30000;

function stripCodeFences(text) {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  return trimmed;
}

function extractJson(text) {
  if (!text) return null;
  const cleaned = stripCodeFences(text);
  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Fall back to extracting first {...} object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw e;
  }
}

async function validateArticle(article) {
  const { title, content } = article || {};

  // Cheap pre-filter: no network call
  if (!title || !content || content.trim().length < 50) {
    return {
      valid: false,
      reason: 'Article title is empty or content is too short to be a valid news article.',
    };
  }

  if (!LLM_API_KEY || !LLM_API_URL) {
    return {
      valid: true,
      reason: 'LLM check unavailable, forwarded for manual review',
    };
  }

  const systemPrompt = `You are a content gatekeeper for a Ugandan news platform. Your only job is to decide whether the submitted text reads as a genuine, coherent news article (not spam, not gibberish, not empty boilerplate, and not test text like "asdf asdf"). Do NOT judge factual accuracy, political bias, or writing quality. Respond ONLY with a JSON object in this exact format: {"valid": true, "reason": "..."} or {"valid": false, "reason": "..."}.`;

  const userPrompt = `Title: ${title}\n\nContent:\n${content}\n\nIs this a structurally valid news article?`;

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
        format: 'json',
        stream: false,
        options: {
          temperature: 0,
          num_predict: 200,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`LLM API returned ${response.status}`);
    }

    const json = await response.json();
    const raw = json.message?.content || json.response || '';
    const parsed = extractJson(raw);
    if (!parsed) {
      throw new Error(`Failed to parse LLM response: ${raw}`);
    }

    if (typeof parsed.valid !== 'boolean') {
      throw new Error('LLM response missing valid boolean');
    }

    return {
      valid: parsed.valid === true,
      reason: parsed.reason || null,
    };
  } catch (err) {
    clearTimeout(timeout);
    console.error('[LLM Validation] fail-open due to error:', err.message || err);
    return {
      valid: true,
      reason: 'LLM check unavailable, forwarded for manual review',
    };
  }
}

module.exports = { validateArticle };
