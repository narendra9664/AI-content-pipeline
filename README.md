# 🎬 AI-in-Business Content Pipeline

**Weekly motion-graphic reels for luxury real estate developers.**

One reel per week. Each one exposes a real bottleneck in luxury real estate workflows, shows how AI automation fixes it, and psychologically primes the viewer to want your service — without ever sounding like a sales pitch.

---

## 🏗️ Project Structure

```
content-pipeline/
├── README.md                    ← You are here
├── brand/
│   └── config.json              ← Your colors, voice, fonts, CTAs
├── calendar/
│   ├── topics.json              ← All 52 weeks, machine-readable
│   └── calendar.md              ← All 52 weeks, human-readable
├── templates/
│   ├── script-prompt.md         ← Prompt template for script generation
│   ├── social-copy-prompt.md    ← Prompt template for captions/hashtags
│   └── analytics-tracker.md     ← Weekly metrics template
├── workflow/
│   ├── weekly-checklist.md      ← Monday→Friday production checklist
│   └── production-guide.md      ← Step-by-step video production guide
├── scripts/
│   ├── generate-weekly-brief.js ← Auto-generates this week's brief
│   └── topic-picker.js          ← CLI tool to pick/preview topics
├── output/                      ← Your finished reels go here
│   └── .gitkeep
└── shorts-creator/              ← Clone of claude-faceless-shorts-creator
    └── (cloned repo)
```

---

## 🚀 Quick Start

### Step 1: Install Prerequisites

You need these installed on your computer (all free except Claude):

| Tool | What it does | Get it from |
|---|---|---|
| **VS Code** | Code editor (your workspace) | [code.visualstudio.com](https://code.visualstudio.com) |
| **Claude Code** | AI assistant that builds videos | Requires paid Claude plan (~$100/mo) |
| **Node.js 18+** | Runs the animation engine | [nodejs.org](https://nodejs.org) |
| **Python 3.10+** | Runs voice & mixing tools | [python.org](https://www.python.org/downloads/) |
| **ffmpeg** | Encodes the final video | [ffmpeg.org](https://ffmpeg.org/download.html) |
| **Git** | Downloads the video project | [git-scm.com](https://git-scm.com) |

### Step 2: Clone the Video Factory

```bash
cd shorts-creator
git clone https://github.com/hassancs91/claude-faceless-shorts-creator .
cd remotion && npm install && npm run gen && cd ..
```

### Step 3: Add Your API Key

```bash
# In the shorts-creator folder:
copy .env.example .env
# Open .env and paste your ElevenLabs API key
```

### Step 4: Generate Your First Weekly Brief

```bash
node scripts/generate-weekly-brief.js
```

This shows you this week's topic, hook, pain point, and the ready-to-use prompt.

### Step 5: Make Your First Reel

Open Claude Code in the `shorts-creator` folder and paste the prompt from your weekly brief.

---

## 📅 Weekly Workflow (2 hours total)

| Day | Task | Time | Who |
|---|---|---|---|
| **Monday** | Pick topic from calendar, review brief | 15 min | You |
| **Tuesday** | Generate script with Claude, review & edit | 30 min | AI + You |
| **Wednesday** | Produce video with shorts-creator, review | 45 min | AI + You |
| **Thursday** | Generate captions & hashtags, edit for voice | 20 min | AI + You |
| **Friday** | Schedule & publish the reel | 10 min | You |
| **Weekend** | Check analytics, note insights | 15 min | You |

---

## 💰 Monthly Cost Options

| Option | Tools Used | Cost |
|---|---|---|
| **100% Free Stack** | Remotion (Local Render) + Edge-TTS (Free Voice) + Free Web LLMs | **$0.00/month** |
| **Automated Stack** | Remotion + ElevenLabs API + Claude API | ~$105/month for 4 reels |

See **[Free Motion Graphics Guide](file:///c:/Users/naren/OneDrive/Desktop/personal/student%20MCQ/workflow/free-motion-graphics-guide.md)** for the step-by-step $0 workflow.

---

## 📖 Full Documentation

- **[Brand Configuration](file:///c:/Users/naren/OneDrive/Desktop/personal/student%20MCQ/brand/config.json)** — Colors (`frontdesk AI`), voice, fonts
- **[52-Week Calendar](file:///c:/Users/naren/OneDrive/Desktop/personal/student%20MCQ/calendar/calendar.md)** — Every topic planned out
- **[Free Motion Graphics Guide](file:///c:/Users/naren/OneDrive/Desktop/personal/student%20MCQ/workflow/free-motion-graphics-guide.md)** — 100% Free ($0/mo) video creation guide
- **[Slack & GitHub Actions Setup](file:///c:/Users/naren/OneDrive/Desktop/personal/student%20MCQ/workflow/slack-github-actions-setup.md)** — Automated weekly delivery to Slack
- **[Script Prompt Template](file:///c:/Users/naren/OneDrive/Desktop/personal/student%20MCQ/templates/script-prompt.md)** — Ready-to-use prompts
- **[Weekly Checklist](file:///c:/Users/naren/OneDrive/Desktop/personal/student%20MCQ/workflow/weekly-checklist.md)** — Step-by-step production
- **[Production Guide](file:///c:/Users/naren/OneDrive/Desktop/personal/student%20MCQ/workflow/production-guide.md)** — Detailed video creation guide
