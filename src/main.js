 let currentHTML = '';
  let currentMode = 'create';

  const templates = {
    portfolio: "A sleek portfolio website for a UI/UX designer named Alex Chen. Include a hero section with a bold tagline, a projects grid with 3 case study cards (each with a color gradient thumbnail), an about section with skills listed, and a contact form. Use a clean minimal aesthetic with lots of white space and a subtle blue accent. Add smooth scroll and hover lift effects on cards.",
    landing: "A SaaS landing page for a tool called 'Flowmate' that helps remote teams manage async projects. Include a hero with a bold headline and two CTA buttons, a 3-feature section with icons, a testimonials row with 3 quotes, a pricing table with Free/Pro/Enterprise tiers, and a footer. Use a dark navy theme with electric purple accents and a glassmorphism card style.",
    restaurant: "A restaurant website for 'Casa Bella', an Italian fine dining restaurant in Paris. Include a full-width cinematic hero (use a terracotta/warm gradient), a story section, a menu section with 3 categories (Antipasti, Pasta, Dolci) each with 3 items and prices, a reservation form with date/time picker, and an elegant footer. Use warm cream, terracotta, and gold palette.",
    blog: "A personal blog for a travel writer named Maya Osei. Include a cinematic hero with her name and tagline, a 4-post featured grid with colourful placeholder thumbnails, a newsletter signup section, and a footer. Each post card should show category, reading time, and title. Use a warm editorial serif aesthetic — think Substack meets The Atlantic.",
    ecommerce: "A fashion e-commerce store called 'Lumière' for minimalist luxury clothing. Include a full-width hero banner, a 6-product grid with hover zoom and quick-add buttons, a featured collection strip, and a newsletter bar. Each product should have a gradient placeholder image, name, and price. Use a stark white and charcoal palette with gold accents, very editorial."
  };

  function useTemplate(name, event) {
    document.querySelectorAll('.tpl-chip').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('prompt').value = templates[name];
    updateCounter();
    setMode('create');
  }

  function updateCounter() {
    const len = document.getElementById('prompt').value.length;
    const el = document.getElementById('char-counter');
    el.textContent = `${len} / 1200`;
    el.classList.toggle('warn', len > 1000);
  }

  function setMode(mode) {
    currentMode = mode;
    document.getElementById('tab-create').classList.toggle('active', mode === 'create');
    document.getElementById('tab-refine').classList.toggle('active', mode === 'refine');
    const refineHint = document.getElementById('refine-hint');
    const btnLabel = document.getElementById('btn-label');
    if (mode === 'refine') {
      if (!currentHTML) {
        showError('Generate a site first, then use Refine mode.');
        setMode('create'); return;
      }
      refineHint.style.display = 'block';
      btnLabel.textContent = 'Refine';
      document.getElementById('prompt').placeholder = 'What would you like to change?\n\ne.g. "Make the hero taller and add a particle background"';
    } else {
      refineHint.style.display = 'none';
      btnLabel.textContent = 'Generate';
      document.getElementById('prompt').placeholder = 'A dark brutalist portfolio for a graphic designer named Kai. Bold typography, asymmetric grid, hover glitch effects, projects in a masonry layout, monochrome palette with a single blood-orange accent…';
    }
  }

  function showError(msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }

  let progressInterval = null;
  function startProgress() {
    const bar = document.getElementById('progress');
    bar.style.display = 'block';
    let p = 0;
    bar.style.transform = 'scaleX(0)';
    progressInterval = setInterval(() => {
      p = Math.min(p + Math.random() * 0.04, 0.85);
      bar.style.transform = `scaleX(${p})`;
    }, 400);
  }
  function endProgress() {
    clearInterval(progressInterval);
    const bar = document.getElementById('progress');
    bar.style.transform = 'scaleX(1)';
    setTimeout(() => { bar.style.display = 'none'; bar.style.transform = 'scaleX(0)'; }, 400);
  }

  async function generate() {
    const promptVal = document.getElementById('prompt').value.trim();
    if (!promptVal) { showError('Please describe your website first.'); return; }

    const btn = document.getElementById('generate-btn');
    const empty = document.getElementById('empty');
    const loading = document.getElementById('loading');
    const frame = document.getElementById('frame');

    btn.disabled = true;
    empty.style.display = 'none';
    frame.style.display = 'none';
    loading.style.display = 'flex';
    document.getElementById('error-msg').style.display = 'none';
    startProgress();

    const loadingMessages = ['Building your website', 'Writing HTML & CSS', 'Styling components', 'Adding interactions', 'Almost ready'];
    let idx = 0;
    const msgInterval = setInterval(() => {
      idx = (idx + 1) % loadingMessages.length;
      document.getElementById('load-msg').innerHTML = loadingMessages[idx] + '<span class="load-dots"><span class="load-dot"></span><span class="load-dot"></span><span class="load-dot"></span></span>';
    }, 2500);

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

    const fullPrompt = currentMode === 'create'
      ? promptVal
      : `Modify the existing website as follows: ${promptVal}\n\nCurrent HTML:\n${currentHTML}\n\nKeep everything else the same. Return the full updated HTML.`;

    try {
      // ── PASTE YOUR GEMINI API KEY FROM aistudio.google.com BELOW ──
      const GEMINI_API_KEY = 'AQ.Ab8RN6JhRZyEv-uIisoNIUiv9tvXe4yJCoRjmXxg8jvsGGC_XQ';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt + '\n\n' + fullPrompt }] }]
          })
        }
      );

      const data = await response.json();
      clearInterval(msgInterval);
      endProgress();

      if (data.error) {
        showError(data.error.message || 'API error. Check your Gemini API key.');
        loading.style.display = 'none';
        empty.style.display = 'flex';
        btn.disabled = false;
        return;
      }

      let html = data.candidates[0].content.parts[0].text;
      // Strip markdown fences in case Gemini adds them
      html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      currentHTML = html;

      loading.style.display = 'none';
      frame.style.display = 'block';
      frame.srcdoc = html;

      document.getElementById('dl-btn').disabled = false;
      document.getElementById('copy-code-btn').disabled = false;
      document.getElementById('copy-html-btn').disabled = false;

      const urlText = document.getElementById('url-text');
      urlText.textContent = 'siteforge://live-preview';
      urlText.className = 'live';

      document.getElementById('prompt').value = '';
      updateCounter();
      setMode('refine');

    } catch (err) {
      clearInterval(msgInterval);
      endProgress();
      showError('Request failed. Please try again.');
      loading.style.display = 'none';
      empty.style.display = currentHTML ? 'none' : 'flex';
      if (currentHTML) frame.style.display = 'block';
    }

    btn.disabled = false;
  }

  function copyCode() {
    if (!currentHTML) return;
    navigator.clipboard.writeText(currentHTML).then(() => {
      ['copy-html-btn', 'copy-code-btn'].forEach(id => {
        const b = document.getElementById(id);
        const orig = b.textContent;
        b.textContent = '✓ Copied';
        setTimeout(() => { b.textContent = orig; }, 2000);
      });
    });
  }

  function downloadHTML() {
    if (!currentHTML) return;
    const blob = new Blob([currentHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'website.html'; a.click();
    URL.revokeObjectURL(url);
  }

  document.getElementById('prompt').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate();
  });

