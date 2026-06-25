# MicrosoftHackathon

FeedbackFlow — a React 19 + Vite SPA with an Express + `node:sqlite` backend that
turns raw product feedback into actionable pain points and before/after wireframes.

## Running

```bash
npm install
npm run dev      # client (Vite) + API server (http://localhost:3001) together
```

The API server stores feedback in `server/feedback.db` (git-ignored).

## AI configuration

Two features call AI models; both **degrade gracefully to local heuristics** when
no token is configured, so the app always runs.

- **Feedback Assistant** (live coaching as you type) and the **Pain-Point
  Coalescer** (semantic clustering of feedback into pain points) use the
  [GitHub Models](https://github.com/marketplace/models) inference API
  (`openai/gpt-4o-mini`). They read a GitHub token from the server environment —
  set one before `npm run dev`:

  ```bash
  # PowerShell
  $env:GITHUB_TOKEN = "github_pat_..."   # needs the models:read permission
  ```

  Accepted env vars (first match wins): `GITHUB_TOKEN`, `GITHUB_MODELS_TOKEN`,
  `GH_TOKEN`. The token stays on the server and is never sent to the browser.
  Override the model with `GITHUB_MODELS_MODEL`.

- **Wireframes** (before/after) use the Copilot CLI in full isolation. Run
  `npm run pregen` to warm the wireframe cache.

> Never commit a token or `server/feedback.db`.