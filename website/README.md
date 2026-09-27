# frontdesk AI website

A single static page (`index.html` + `assets/`) for Netlify. It has no build step and no dependencies.

## Deploy

- **Quickest:** drag this `website/` folder onto <https://app.netlify.com/drop>, or onto your existing site under **Deploys**.
- **From Git:** set the site's base directory to `website`. Leave the build command empty and the publish directory at `.`, which `netlify.toml` already sets.

## The audit form

- The form uses Netlify Forms (`data-netlify="true"`). Submissions appear under **Forms → audit** in the Netlify dashboard once the site is deployed on Netlify.
- To get an email for each request, turn on email notifications in **Site settings → Forms → Form notifications**.

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
