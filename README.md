## still need money for api key :(
site forge ; **AI-powered website builder** that generates complete, production-ready HTML websites from a text prompt — powered by Claude.

## What it does

Type a description of the website you want, hit **Generate**, and SiteForge returns a fully coded single-file HTML page with CSS and JavaScript included. You can then use **Refine mode** to iterate on the result with follow-up instructions.

## Features

-  **AI generation** via Claude (Anthropic API)
-  **Refine mode** — tweak an existing generated site with natural language
-  **Quick-start templates** — Portfolio, SaaS, Restaurant, Blog, Shop
-  **Copy or download** the generated HTML instantly
-  **Secure** — API key stays on the server, never in the browser

## Tech stack

- **Frontend**: Vanilla HTML/CSS/JS
- **Backend**: Vercel serverless function (`/api/generate`)
- **AI**: Anthropic Claude (`claude-sonnet-4`)


## Project structure

```
/
├── index.html        # Frontend UI
├── styles.css        # Styles
├── main.js           # Client-side logic
├── vercel.json       # Vercel routing config
├── .env              # API key (never commit this)
└── api/
    └── generate.js   # Serverless backend — calls Anthropic API
```

## license

mit
