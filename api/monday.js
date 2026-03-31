export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const MONDAY_TOKEN = process.env.MONDAY_API_TOKEN;
  if (!MONDAY_TOKEN) {
    return res.status(500).json({ error: 'MONDAY_API_TOKEN not configured in environment variables' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing "query" in request body' });
    }

    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MONDAY_TOKEN,
        'API-Version': '2024-10'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'Monday API error: ' + text });
    }

    const result = await response.json();
    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
