# Video Production Guide

A step-by-step walkthrough for creating your weekly reel using the
`claude-faceless-shorts-creator` project.

---

## What This Tool Does (In Plain English)

Think of it like this:

1. **You describe a video** in plain English ("make a short about lead response time")
2. **Claude Code reads your description** and writes the entire video as code
3. **Remotion** (the animation engine) turns that code into actual video frames — like how a web page is built from HTML, this video is built from code
4. **ElevenLabs** generates the voiceover and tells the system exactly when each word is spoken
5. **The system syncs everything** — captions appear on the exact word, animations match the beats, sound effects hit at the right moments
6. **ffmpeg** (a free video tool) packages it all into a standard MP4 file

No filming. No editing software. No stock footage. Every pixel is drawn by code.

---

## First-Time Setup (Do This Once)

### 1. Clone the Project

```bash
cd "c:\Users\naren\OneDrive\Desktop\personal\student MCQ\shorts-creator"
git clone https://github.com/hassancs91/claude-faceless-shorts-creator .
```

What this does: Downloads the entire video factory to your computer. Think of it like downloading a blank template.

### 2. Install Dependencies

```bash
cd remotion
npm install
npm run gen
cd ..
```

What this does:
- `npm install` downloads all the tools the animation engine needs (like installing apps on a new phone)
- `npm run gen` prepares the animation system to start creating videos

### 3. Set Up Your API Key

```bash
copy .env.example .env
```

Then open the `.env` file and paste your ElevenLabs API key:

```
ELEVENLABS_API_KEY=your_key_here
```

Where to get the key: [elevenlabs.io](https://elevenlabs.io) → sign up → API Keys section → copy

### 4. Verify Everything Works

```bash
npm run studio
```

What this does: Opens a preview window where you can see the 16 example videos. If this works, you're all set.

---

## Weekly Production Workflow

### Step 1: Get This Week's Brief

Run the topic picker:
```bash
cd "c:\Users\naren\OneDrive\Desktop\personal\student MCQ"
node scripts/generate-weekly-brief.js
```

This shows you:
- This week's topic and hook
- The complete 6-beat script
- The ready-to-paste prompt for Claude Code

### Step 2: Generate the Video

1. Open VS Code
2. Open the `shorts-creator` folder
3. Start Claude Code (from the extension panel or type `claude` in terminal)
4. Paste the prompt from Step 1

Claude will:
1. **Show you a plan first** — the hook, beat sheet, visual descriptions, voiceover lines
2. **Wait for your approval** — read the plan and change anything you don't like
3. **Build the composition** — write the animation code
4. **Generate the voice** — call ElevenLabs for narration + word timestamps
5. **Sync captions** — place each word exactly where it's spoken
6. **Add sound effects** — match effects from the library to key moments
7. **Render** — produce the final 1080x1920 MP4

### Step 3: Review the Output

The finished video lands in the short's output folder. Watch it and check:

| Check | What to look for |
|---|---|
| **Thumbnail** | Frame 0 should be visually striking (this IS your thumbnail) |
| **Hook** | First 3 seconds must grab attention |
| **Captions** | Each word appears exactly when spoken |
| **Pacing** | Not too fast (luxury audience), not too slow (it's 40 seconds) |
| **Animations** | Charts, diagrams, numbers animate smoothly |
| **Audio** | Voice clear, music subtle, sound effects enhance not distract |
| **Loop** | Last frame transitions seamlessly to first frame |
| **Brand colors** | Electric blue (#00A3FF) and gold (#FFD700) consistent |

### Step 4: Fix Issues (If Needed)

If something's off, tell Claude Code specifically what to change:

```
The caption at beat 3 is 2 frames late. Fix the timing.
```

```
The bar chart animation is too fast. Slow it to 2 seconds.
```

```
The gold accent (#FFD700) is too bright. Use #D4A800 instead.
```

Claude will update the code and re-render. Usually takes 1-2 rounds.

### Step 5: Export

Copy the final MP4 to your output folder:
```
output/week-01-sales-team-calling-ghosts.mp4
```

---

## Customization Reference

### Changing the Voice

In your `.env` file or in the prompt to Claude:
```
Use ElevenLabs voice ID: [YOUR_VOICE_ID]
```

Find voice IDs at: ElevenLabs → Voices → click any voice → copy the voice ID

### Changing Colors

Tell Claude in the prompt:
```
Use these brand colors:
- Background: #0A0A0F
- Primary accent: #00A3FF (electric blue)
- Secondary accent: #FFD700 (gold)
- Text: #FFFFFF
- Muted text: #A0A0B0
```

### Adding Your Logo/Watermark

Ask Claude:
```
Add a watermark in the bottom-right corner: "@youragency" in white
at 60% opacity, using Inter font at 14px.
```

### Changing Duration

The default is ~40 seconds. To adjust:
```
Make this short 30 seconds instead of 40. Tighten the beats accordingly.
```

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `npm run studio` fails | Node not installed or wrong version | Install Node 18+ from nodejs.org |
| ElevenLabs error | Missing or invalid API key | Check `.env` file, regenerate key |
| Render crashes | Missing ffmpeg | Install ffmpeg and add to PATH |
| No audio | ElevenLabs quota exceeded | Check your plan limits |
| Blurry output | Resolution setting wrong | Ensure 1080x1920 in the composition |
| Python error | Python not installed or wrong version | Install Python 3.10+ |

---

## Cost Per Reel

| Component | Cost per reel |
|---|---|
| Claude Code usage | ~$2-5 (depends on iterations) |
| ElevenLabs voice | ~$0.50-1.00 (for 40 seconds) |
| Render time | Free (runs on your computer) |
| **Total** | **~$3-6 per reel** |
