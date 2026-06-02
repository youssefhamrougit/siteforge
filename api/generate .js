export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, currentHTML, mode } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const systemPrompt = `You are SiteForge, an expert web developer. Generate complete, single-file HTML websites with embedded CSS and JS.

Rules:
- Return ONLY the raw HTML. No markdown, no backticks, no explanation.
- Everything must be in one HTML file (inline <style> and <script>).
- Make it visually stunning, modern, and production-ready.
- Use real placeholder content (no Lorem Ipsum).
- All images: use https://picsum.photos/ or CSS gradients.
- Fully responsive.`;

  const userMessage = mode === 'refine' && currentHTML
    ? `Here is the current website HTML:\n\n${currentHTML}\n\nRefine it with these changes: ${prompt}\n\nReturn the complete updated HTML file.`
    : `Create a complete website: ${prompt}`;

  try {
    const response = await fetch('https://ai.hackclub.com/proxy/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-5',
        max_tokens: 8000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('API error:', err);
      return res.status(500).json({ error: 'AI request failed. Please try again.' });
    }

    const data = await response.json();
    let html = data.choices?.[0]?.message?.content || '';

    // Strip markdown fences if model added them
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      return res.status(500).json({ error: 'Invalid response from AI. Please try again.' });
    }

    return res.status(200).json({ html });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
