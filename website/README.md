# frontdesk AI website

A single static page (`index.html` + `assets/`) for Netlify. It has no build step and no dependencies.

## Deploy

- **Quickest:** in the Netlify project, first turn on the form (see below). Then drag this `website/` folder onto the drop box at the bottom of the project's **Deploys** page. The new version replaces the old one at the same address. If that page has no drop box, the project builds from a Git repository, so use the next option.
- **From Git:** set the project's base directory to `website`. Leave the build command empty and the publish directory at `.`, which `netlify.toml` already sets.

## The audit form

- The form uses Netlify Forms (`data-netlify="true"`). Netlify leaves form detection off for new projects, so click **Forms → Enable form detection** once. It applies from the next deploy.
- Submissions appear under **Forms → audit**. The page thanks the visitor only after Netlify accepts the submission. If it fails, the form stays open with a retry message and the Instagram fallback.
- To get an email for each request, go to **Project configuration → Notifications → Form submission notifications → Add notification → Email notification**. The subject names the company and its monthly enquiry volume, and Reply goes straight to the person who asked, because the form's `email` field sets Reply-To.
- To feed requests into another tool (a CRM, n8n, Make or a WhatsApp alert), add an **Outgoing webhook** in the same place. Netlify posts each submission there as JSON.

## Assets

| File | What it is |
|---|---|
| `assets/hero.mp4` | The W1 film. It autoplays muted and loops, with a Sound on toggle. Re-encoded from `explainer/out/series/W1.mp4`. |
| `assets/hero-poster.jpg` | First frame of the film, shown while the video loads. |
| `assets/still-*.jpg` | Product visuals rendered from the same Remotion components as the videos (`explainer/src/series/Stills.tsx`). |
| `assets/og-image.jpg` | Link-preview image (1200×630). |
| `assets/favicon.svg` | The FD mark. |
| `assets/fonts/` | Instrument Serif and Inter, self-hosted (SIL Open Font License). |

To re-render a still:

```bash
cd explainer
npx remotion still src/index.ts StillDashboard ../website/assets/StillDashboard.png --frame=430
# then save it as assets/still-dashboard.jpg (JPEG, quality ~84)
```

## Before going live, check

- **Channels and features:** the page names website, paid social, search, WhatsApp and email. Keep only the ones you support today.
- **Privacy and follow-up copy:** the FAQ answers on consent and on message approval describe how you work. Edit them to match your actual process.
- **Demo content:** the property (VELORIA) and the buyers are fictional. The footer says so.
