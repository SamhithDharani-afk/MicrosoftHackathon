# FeedbackFlow

**Turn raw user feedback into visual, shippable fixes — automatically.**

FeedbackFlow closes the gap between *"users are frustrated"* and *"here's the fix."*
You drop a feedback widget onto any page; our AI coaches users to write **useful**
feedback as they type, clusters the noise into ranked **pain points**, and then
generates the actual fix — a **before/after wireframe**, a **process-flow diagram**,
a **step-by-step slideshow**, and a **simulated-usage animation** — in seconds.

> One vague complaint → a design spec your team can ship this afternoon.

---

## TL;DR — run the demo in 3 commands

```powershell
npm install
npx playwright install chromium      # one-time; needed for wireframe/slideshow capture
npm run dev                          # client + API together
```

Then open **http://localhost:5173**.

For the full demo experience (with the embeddable widget on a "real" host page),
also start the demo support site in a second terminal:

```powershell
npm run demo                         # http://localhost:4000/microsoft-support.html
```

> **The app always runs without any AI token** — every AI feature degrades
> gracefully to a local heuristic or to bundled, pre-generated content. A token
> just makes generation live. See [AI configuration](#ai-configuration).

---

## Requirements

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | **22+** (tested on 24) | The backend uses the built-in `node:sqlite` module (no native deps). |
| **npm** | 9+ | Ships with Node. |
| **Chromium** | via Playwright | `npx playwright install chromium`. Only needed for wireframe/slideshow/GIF capture. |
| **GitHub token** | optional | Unlocks live AI (GitHub Models + Copilot CLI). Optional for the demo. |

---

## Ports & URLs

| Service | URL | Started by |
|---|---|---|
| Web app (Vite) | http://localhost:5173 | `npm run dev` / `npm run dev:client` |
| API server (Express) | http://localhost:3001 | `npm run dev` / `npm run server` |
| Demo "host" site | http://localhost:4000/microsoft-support.html | `npm run demo` |

The Vite dev server proxies `/api/*` to the API on 3001, so the browser only ever
talks to 5173.

---

## npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Runs the **client + API together** (via `concurrently`). Use this for the demo. |
| `npm run dev:client` | Vite client only. |
| `npm run server` | Express API only (port 3001). |
| `npm run demo` | Serves `demo-site/` (the embeddable-widget host page) on port 4000. |
| `npm run pregen` | **Pre-warms every expensive AI artifact** (wireframes, pain-point clusters, slideshows, usage GIFs) into the SQLite cache so the live demo is instant. |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Serves the production build. |
| `npm run lint` | Lint with `oxlint`. |

---

## The full loop (what to show a judge)

FeedbackFlow is one continuous pipeline. Each step is a real screen in the app:

1. **Add a website** (`/add-website`) — register any product/page to collect
   feedback for. Optionally **connect a GitHub repo** so fixes can open a PR.
2. **Collect feedback** (`/form/:websiteId`, or the embeddable widget) — a
   drop-in form. As the user types, the **AI Feedback Assistant** coaches them in
   real time with a live quality score and concrete suggestions, so you get
   *actionable* feedback, not "it's broken."
3. **Analyze** (`/dashboard`) — the **Pain-Point Coalescer** semantically clusters
   raw feedback into ranked pain points (by **severity**, **impact**, and
   **mention count**) — not a flat list of complaints.
4. **Fix** (`/pain-point/:id`, `/wireframe/:id`, `/process-flow/:id`) — for each
   pain point we generate:
   - a **before/after wireframe** with a marker pointing at exactly what changed;
   - a **process-flow diagram** (the user's journey before vs. after);
   - a **slideshow walkthrough** captured from the real redesigned wireframe;
   - a **simulated-usage GIF** — a fake cursor finds and uses the new control.
5. **Ship** — refine any wireframe with a prompt, or **push a design spec to a
   PR** on the connected repo.

### Hero pain point for the demo

Use **"Settings Button Not Discoverable in Microsoft Support"** (pain point
`pp-301`). It has bundled/curated artifacts and pre-generated media, so the demo
never depends on a live network call. The demo host page
(`demo-site/microsoft-support.html`) intentionally *has* this exact problem — it's
the broken "before."

> A detailed, timed presenter script lives in **[`demo.md`](./demo.md)**.

---

## AI configuration

Two backends power the AI features. **Both are optional** — without a token the app
falls back to local heuristics / pre-generated content and still runs end to end.

### 1. GitHub Models (Feedback Assistant + Pain-Point Coalescer)

These use the [GitHub Models](https://github.com/marketplace/models) inference API
(`openai/gpt-4o-mini`). Set a token in the **server** environment before `npm run dev`:

```powershell
# PowerShell — needs the `models:read` permission
$env:GITHUB_TOKEN = "github_pat_..."
npm run dev
```

Accepted env vars (first match wins): `GITHUB_TOKEN`, `GITHUB_MODELS_TOKEN`,
`GH_TOKEN`. The token stays on the server and is **never** sent to the browser.
Override the model with `GITHUB_MODELS_MODEL`.

### 2. Copilot CLI (wireframe / walkthrough generation)

Wireframes and walkthroughs are generated through the Copilot CLI in full
isolation. Capture (slideshow + GIF) uses **Playwright/Chromium**.

### Pre-warm everything for the demo

```powershell
$env:GITHUB_TOKEN = "github_pat_..."
npm run pregen              # warms the default demo sites
npm run pregen ms-support   # or scope to one site
```

`pregen` is idempotent — already-cached work is skipped — so re-running is cheap.
Warmed artifacts are served instantly from the SQLite cache during the demo.

---

## Project structure

```
src/                     React 19 + Vite SPA
  pages/                 LandingPage, ManagerDashboard, PainPointDetail,
                         WireframeView, ProcessFlowView, AddWebsite, PublicForm, …
  components/            FeedbackForm (AI coaching), WalkthroughSlideshow,
                         WalkthroughVideo, wireframe overlay editor, …
  context/               ThemeContext (dark by default), WebsitesContext
  data/                  mockData.js (seed feedback + curated pain points),
                         clustering.js (severity/impact math)
  utils/                 api.js (client → API), screenshot.js, severity.js, github.js
server/                  Express + node:sqlite backend
  index.js               API routes + DB bootstrap + seeding
  assist-service.js      Feedback Assistant grading
  coalesce-service.js    Semantic pain-point clustering (cached)
  wireframe-service.js   Before/after, slideshow, usage-GIF (Playwright + cache)
  github-models.js       GitHub Models client + token handling
  pregen.js              Pre-warm all caches for the demo
  feedback.db            SQLite DB (git-ignored, created at runtime)
demo-site/               Standalone "host" page with the embeddable widget
demo.md                  Timed presenter script
```

### Key API endpoints (port 3001)

`GET/POST /api/feedback` · `GET /api/pain-points` · `POST /api/assist` ·
`GET /api/wireframe` · `POST /api/wireframe/after` ·
`GET/POST /api/walkthrough/slideshow` · `GET/POST /api/walkthrough-video` ·
`POST /api/process-flow` · `POST /api/walkthrough` · `POST /api/dev-prompt`

---

## Data & persistence

- Feedback and AI caches live in **`server/feedback.db`** (SQLite, **git-ignored**,
  created on first run). Example feedback is **seeded once** when the table is empty.
- Pain-point clusters, wireframes, slideshows, and usage GIFs are cached in their
  own tables and auto-invalidate when the underlying feedback changes.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `EADDRINUSE: :3001` | An API server is already running — stop it, or set `$env:PORT=3002` before `npm run server`. |
| Wireframe/slideshow capture fails | Run `npx playwright install chromium`. |
| AI features "unavailable" / using heuristics | Set `GITHUB_TOKEN` in the **server** env (the terminal running `npm run dev`). |
| Demo generation feels slow on stage | Run `npm run pregen` beforehand to warm the caches. |
| Dashboard empty | The DB seeds on first run; if you cleared `feedback.db`, restart the API. |

---

## Notes

- **Default theme is dark.**
- **Never commit** a token or `server/feedback.db`.
- The app is intentionally resilient: no token, no network, no problem — it still
  demonstrates the entire feedback-to-fix loop.
