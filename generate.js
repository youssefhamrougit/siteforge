export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers — allows your frontend to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { prompt, currentHTML, mode } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const systemPrompt = `You are an elite web developer. Generate a complete, visually stunning single-file HTML website.
STRICT RULES:
- Return ONLY raw HTML starting with <!DOCTYPE html>. Zero markdown, zero backticks, zero explanation.
- All CSS inside <style> in <head>. All JS inside <script> before </body>.
- Use Google Fonts (import via @import in the style tag).
- Design must be EXCEPTIONAL — professional, memorable, polished. Not generic.
- Use rich gradients, shadows, hover transitions, and micro-animations.
- Populate with realistic content (no lorem ipsum).
- Fully responsive. Include a hamburger menu if there's a navbar.
- Use CSS custom properties for the color system.
- Add scroll-reveal or fade-in animations using IntersectionObserver.`;

  const userMsg = mode === 'refine'
    ? `Modify the existing website as follows: ${prompt}\n\nCurrent HTML:\n${currentHTML}\n\nKeep everything else the same. Return the full updated HTML.`
    : prompt;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    let html = data.content[0].text;
    // Strip any accidental markdown fences
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    return res.status(200).json({ html });
  } catch (err) {
    return res.status(500).json({ error: 'Request to Anthropic failed. Try again.' });
  }
}
               