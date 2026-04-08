export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const AUTH_PASSWORD = process.env.AUTH_PASSWORD;
  if (!AUTH_PASSWORD) {
    return res.status(500).json({ error: 'AUTH_PASSWORD not configured in environment' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email domain
    const emailLower = email.trim().toLowerCase();
    if (!emailLower.endsWith('@pubitygroup.com')) {
      return res.status(401).json({ error: 'Access restricted to PubityGroup.com email addresses' });
    }

    // Validate password
    if (password !== AUTH_PASSWORD) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Generate a simple session token (email + timestamp + random, base64 encoded)
    const tokenData = JSON.stringify({
      email: emailLower,
      ts: Date.now(),
      r: Math.random().toString(36).slice(2)
    });
    const token = Buffer.from(tokenData).toString('base64');

    return res.status(200).json({ success: true, token, email: emailLower });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
