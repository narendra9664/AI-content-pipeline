# frontdesk AI website

> **This folder moved.** The live site now deploys from [narendra9664/UserTracking-system](https://github.com/narendra9664/UserTracking-system), so make changes there. This is the copy it started from.

The marketing site, plus a live demo of the product running on it:

- **Live panel:** visitors who opt in see what the system records about them, and their intent score, as they browse.
- **Instant reply:** anyone who requests an audit gets a personal, AI-written reply by email within seconds.
- **Owner brief:** the owner gets the lead's score, timeline and a short brief.

It runs on free tiers: Netlify (hosting, Functions, Blobs, Forms), the Gemini API and Gmail.

## How it works

```
visitor taps "Show me"
  └─ assets/track.js  records events in the browser, shows the live panel,
                      posts batches to /api/track ────────► Netlify Blobs
audit form submitted
  ├─ Netlify Forms    stored copy + the Netlify email alert (backup)
  └─ /api/lead        loads the visit ─► scores it ─► Gemini writes the reply (5.5 s, checked)
                      ─► template if Gemini fails ─► Gmail sends it ─► lead stored ─► owner brief
/admin                dashboard: leads by score, today's visitors, statuses, setup check (ADMIN_KEY)
cleanup (daily)       deletes old data (see Privacy)
```

| Path | What it is |
|---|---|
| `public/` | Everything visitors can load. Nothing else in this folder is published. |
| `public/assets/track.js` | Consent bar, event tracking, the "What we see" panel. |
| `public/assets/score.js` | The intent-score rules, shared by the browser, the functions and the dashboard. |
| `public/admin/index.html` | The owner's dashboard. It is not indexed by search engines, and its data requires the dashboard password. |
| `public/privacy.html` | What is recorded, why, for how long, and how to delete it. |
| `netlify/functions/` | `track`, `lead`, `admin` and the scheduled `cleanup`. |
| `netlify/lib/` | Storage, input checks, the Gemini reply with its guardrails, and email. |
| `tests/` | Unit tests (`npm test`). |

### The score

| Signal | Points |
|---|---|
| Return visit | +10 each, up to 20 |
| Watched the film to 50% with sound | +15 |
| Turned the film sound on | +5 |
| Read a section (3 s or more) | How it works +8, Product +10, Why it matters +6, FAQ +6, Audit +10 |
| Opened an FAQ question | +3 each, up to 9 |
| Clicked a call to action | +6 each, up to 12 |
| Started the audit form | +10 |
| Arrived from a campaign link (`?utm_source=…`) | +5 |

The score is capped at 100. **Hot** is 70 or more, **Warm** is 40 to 69, **Nurture** is below 40. Add UTM tags to every link you share (for example `?utm_source=linkedin&utm_medium=dm`), so the dashboard shows where each lead came from.

## Set up (once)

1. **Link the repository.** In Netlify, go to **Project configuration → Build & deploy → Link repository** and pick this repository. Then set:
   - **Branch to deploy:** the branch that holds this folder.
   - **Base directory:** `website`.
   - **Build command:** leave it empty.

   `netlify.toml` sets the publish folder (`public`) and the functions folder. Drag-and-drop deploys can't include functions, so linking is required.
2. **Environment variables.** Add these under **Project configuration → Environment variables**. Mark the keys and passwords as secret if Netlify offers the option.

   | Variable | Value |
   |---|---|
   | `GEMINI_API_KEY` | Key from Google AI Studio. |
   | `GMAIL_USER` | The Gmail address that sends replies. |
   | `GMAIL_APP_PASSWORD` | A Gmail app password. Turn on 2-Step Verification first, then go to Google Account → Security → App passwords. |
   | `ADMIN_KEY` | The dashboard password: long and random. |
   | `OWNER_EMAIL` | Where lead briefs go. Defaults to `GMAIL_USER`. |
   | `SITE_URL` | The site's address, used for the dashboard link in briefs. |
   | `GEMINI_MODEL` | Optional. Models to try in order, comma-separated. Defaults to `gemini-3.1-flash-lite,gemini-flash-lite-latest`. |
   | `OWNER_TZ` | Optional. Time zone for times in briefs. Defaults to `Asia/Kolkata`. |

   Functions read these settings when they are deployed. After adding or changing one, go to **Deploys → Trigger deploy**.

3. **Forms:** form detection must be on (**Forms → Enable form detection**). The Netlify email alert, under **Forms → Submission notifications**, is a backup to the brief.
4. **Test it on your phone:**
   1. Tap "Show me" and browse, then open the live panel.
   2. Submit the audit form. The reply should arrive within about 10 seconds, followed by the brief.
   3. Check that the lead appears at `/admin`.

   The dashboard's **Setup** card shows which settings the live deploy has. **Send a test reply to yourself** runs Gemini and Gmail without the form or its limits.

## Safeguards

- **Limits:** one automatic reply per email address per day, five requests per network per day (mobile carriers share IP addresses), and 40 in total per day.
  - When a limit is hit, the request is still stored.
  - Hitting the per-network or daily limit stops all emails, briefs included.
  - A repeat from the same address gets no second reply, but you still get a brief.
- **Bots:** a honeypot field and a 4-second minimum are applied. Bots get a polite no-op.
- **Form fields go into outgoing email only after links are stripped,** so the form can't be used to send spam from your Gmail.
- **Gemini's output is checked before sending.** A reply is rejected, and the template used instead, if it has:
  - links, prices, percentages or guarantees;
  - markdown;
  - a length outside the limits.

  The sign-off is always ours. The P.S. with the elapsed time is written by code, so it is always true.
- **Time limit:** Netlify stops functions after 10 s. Gemini gets 5.5 s, split across two models: `gemini-3.1-flash-lite`, then `gemini-flash-lite-latest` (set `GEMINI_MODEL` to a comma-separated list to change this). The brief is sent after the response.
- **Free tiers:**
  - Netlify's older free plan includes 125,000 function requests and 100 form submissions a month.
  - Gemini's free-tier quota changes without notice; the template covers any gap.
  - Gmail allows about 500 emails a day.
  - **Before using this with a client's data, move Gemini to the paid tier.** On the free tier Google may use prompts to improve its products.

## Privacy

- **Consent:** nothing is recorded until the visitor taps "Show me". Browsers sending Global Privacy Control are never asked. The footer's "Live demo" link lets them opt in later.
- **Deletion:** "Stop tracking and delete my data" in the panel deletes everything stored for that browser.
- **Retention:** the daily cleanup deletes browsing data from visitors without a lead after 30 days, and leads after 12 months.
- **Gemini:** it receives first name, company, website, enquiry volume and a summary of the visit. It never receives email addresses or phone numbers.
- **Keep `privacy.html` accurate** whenever any of this changes.

## Local development

```bash
cd website
npm install
npm test            # score rules, input checks, Gemini guardrails
```

To run the site with its functions, use the Netlify CLI.
- **Flags:** run it from `website/` with explicit paths, because it treats the git root as the project:
  ```bash
  netlify dev --offline --cwd . --dir public --functions netlify/functions
  ```
- **Test settings:** export them in the shell first:
  - `MAIL_TRANSPORT=json` builds emails without sending them.
  - `GEMINI_ENDPOINT=http://127.0.0.1:8787/v1beta` points Gemini at a local fake.
  - Also set `ADMIN_KEY`, `GMAIL_USER` and a placeholder `GEMINI_API_KEY`.
- **Offline sandboxes:** if the CLI can't download Deno, put a Deno binary on `PATH` (`npm i deno`).

## Assets

| File | What it is |
|---|---|
| `public/assets/hero.mp4` | The W1 film. It autoplays muted and loops, with a Sound on toggle. Re-encoded from `explainer/out/series/W1.mp4`. |
| `public/assets/hero-poster.jpg` | First frame of the film, shown while the video loads. |
| `public/assets/still-*.jpg` | Product visuals rendered from the same Remotion components as the videos (`explainer/src/series/Stills.tsx`). |
| `public/assets/og-image.jpg` | Link-preview image (1200×630). |
| `public/assets/favicon.svg` | The FD mark. |
| `public/assets/fonts/` | Instrument Serif and Inter, self-hosted (SIL Open Font License). |

To re-render a still:

```bash
cd explainer
npx remotion still src/index.ts StillDashboard ../website/public/assets/StillDashboard.png --frame=430
# then save it as public/assets/still-dashboard.jpg (JPEG, quality ~84)
```

## Before going live, check

- **Channels and features:** the page names website, paid social, search, WhatsApp and email. Keep only the ones you support today.
- **Follow-up copy:** the FAQ answer on message approval describes how you work. Edit it to match your process.
- **Demo content:** the property (VELORIA) and the buyers are fictional. The footer says so.
