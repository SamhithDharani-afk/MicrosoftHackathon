# FeedbackFlow — Demo Script (2–5 min)

**Tagline:** *Turn raw user feedback into visual, shippable fixes — automatically.*

---

## 0. Setup (before you present)

- [ ] `npm run dev` running → app at **http://localhost:5173**, API at **http://localhost:3001**
- [ ] Demo support page server running → `node demo-site/serve.mjs` → **http://localhost:4000/microsoft-support.html**
- [ ] (Optional, for live AI) `GITHUB_TOKEN` set in the server env so the Feedback Assistant + generation use real models instead of heuristics
- [ ] Browser tabs pre-opened: **(1)** FeedbackFlow Landing, **(2)** Microsoft Support demo page, **(3)** Manager Dashboard
- [ ] Pick the hero pain point in advance: **"Settings Button Not Discoverable in Microsoft Support"** (it has a curated walkthrough + flow to fall back on)

---

## 1. The Pitch (~45 sec)

> "Every product team is drowning in feedback — support tickets, surveys, reviews — but it sits in spreadsheets and nobody acts on it. The gap between *'users are frustrated'* and *'here's the fix'* is where products die.
>
> **FeedbackFlow closes that gap.** You drop a feedback form onto any page. Our AI coaches users to write *useful* feedback as they type, clusters the noise into ranked **pain points**, and then — the magic part — it generates the actual **fix**: a before/after wireframe, a process flow, and a step-by-step walkthrough. From a one-line complaint to a design spec your team can ship, in seconds."

Transition: *"Let me show you the whole loop — live."*

---

## 2. Tech Demo (~3 min)

### Beat 1 — The Product (~30 sec)
**Tab 1: Landing → Dashboard**
- Show the **Landing page**: "Add your website, collect feedback, get visual solutions." Point at the *How It Works* strip (Add → Collect → Analyze → Fix).
- Click into the **Manager Dashboard**. Call out: each website has its own dashboard; pain points are **ranked by severity, impact, and mention count** — not a flat list of complaints.

> Say: *"This is what a PM sees Monday morning — not 400 tickets, but the 5 things that actually matter, sorted."*

### Beat 2 — Feedback at the source (~45 sec)
**Tab 2: Microsoft Support demo page (localhost:4000/microsoft-support.html)**
- Scroll the page — it looks like a real **support.microsoft.com** clone.
- Point out the **embedded feedback form**: *"This is a seamless drop-in widget — a collapsible dropdown, an iframe, zero redesign of the host page."* Expand/collapse it once.
- **Submit a piece of feedback live.** As you type, show the **AI Feedback Assistant** coaching in real time (live tips / quality nudges as you write).
- Submit something like: *"I can't find the settings anywhere on this support page — no gear icon, nothing in my profile menu."*

> Say: *"Notice the page itself has the exact problem the user is complaining about — no visible settings, no search, no live agent. That's intentional: this is the broken 'before'."*

### Beat 3 — It pops into the feed (~20 sec)
**Tab 3: back to Dashboard**
- Refresh / show the feed — the **new feedback appears**, clustered into the matching pain point, mention count ticking up.

> Say: *"That feedback didn't go to a void. It's already analyzed, clustered, and prioritized."*

### Beat 4 — Generate the fix, then cover the wait (~60–75 sec)
- On the **"Settings Button Not Discoverable"** pain point, click **Generate** (wireframe / solution).
- **While it loads**, keep talking — don't stare at the spinner. Walk over to the other artifacts:
  - **Process Flow view** — *"For each pain point we also generate the user's journey as a flow graph — where they get stuck, and the streamlined path after the fix."* (Pan/zoom the ReactFlow graph.)
  - **Slideshow / Visual Walkthrough** (on the Pain Point detail) — *"And a step-by-step visual walkthrough a designer or support agent can follow — 'add a gear here, it opens this panel, user changes the setting.'"* Click through 2–3 slides.
- Return to the **Wireframe view** now that it's done:
  - Show the **before vs. after**.
  - Use the **zoom-in + change marker**: the red bobbing arrow / "NEW" badge points at exactly what changed (the new settings gear).
  - **Refine with a prompt** once (e.g. *"make the gear icon bigger"*) to show it's interactive and the marker tracks the change — *without* tearing apart the rest of the page.

> Say: *"This is a real, editable design spec — and it can open a PR straight to the connected repo."*

---

## 3. Close (~30 sec)

> "So that's the full loop: **feedback in → AI coaching → clustered pain points → an actual before/after design, a process flow, and a walkthrough out.** One vague complaint became something a team can ship this afternoon.
>
> And the whole thing **degrades gracefully** — no AI token? It falls back to local heuristics and still runs. It's resilient, it's embeddable anywhere, and it turns the feedback firehose into a prioritized to-do list with the fixes already drawn.
>
> **FeedbackFlow — stop reading feedback. Start shipping it.**"

---

## Timing cheat sheet

| Section | Target | Running |
|---|---|---|
| Pitch | 0:45 | 0:45 |
| Beat 1 — Product/Dashboard | 0:30 | 1:15 |
| Beat 2 — Support page + AI assist | 0:45 | 2:00 |
| Beat 3 — Feed update | 0:20 | 2:20 |
| Beat 4 — Generate + flow/slideshow + wireframe | 1:15 | 3:35 |
| Close | 0:30 | 4:05 |

> Tight on time? Cut Beat 1 to one sentence and skip the Process Flow, keeping the wireframe reveal as the payoff. Have buffer? Linger on the live AI coaching in Beat 2 and the refine step in Beat 4.

## Demo safety net
- If live AI is slow/unavailable, the **"Settings Button Not Discoverable"** pain point has a **curated walkthrough and flow** bundled — use it so nothing depends on a network call.
- Pre-warm wireframes with `npm run pregen` so the generation in Beat 4 is fast (or already cached).
- Keep the Process Flow / slideshow as your "talk track" to fill any generation wait — never present to a spinner.
