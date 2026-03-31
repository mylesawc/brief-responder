export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured in environment variables' });
  }

  try {
    const { system, messages, model, max_tokens } = req.body;

    const maxRetries = 3;
    let response;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-sonnet-4-20250514',
          max_tokens: max_tokens || 4096,
          system,
          messages
        })
      });

      if (response.ok) break;
      if ((response.status === 529 || response.status === 503 || response.status === 500) && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 2000 * attempt));
        continue;
      }
      // Non-retryable or final attempt
      const errBody = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errBody.error?.message || `Anthropic API error (${response.status})`
      });
    }

    const result = await response.json();
    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
