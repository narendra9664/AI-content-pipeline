# Weekly Production Checklist

Print this or bookmark it. Follow it every week.

---

## 📅 Monday — Topic Selection (15 minutes)

### Tasks:
- [ ] Open `calendar/topics.json` or run `node scripts/topic-picker.js`
- [ ] Review this week's topic, hook, and pain point
- [ ] Check: Is there a current event that makes this topic extra relevant?
- [ ] Check: Did last week's analytics suggest adjusting the angle?
- [ ] Confirm the topic or swap with a future week if needed
- [ ] Write down any personal insights to add to the script

### Decision Point:
> **Go with the planned topic?** If yes, move to Tuesday.  
> **Swap topics?** Note which week you're pulling from and which you're pushing to.

---

## 📝 Tuesday — Script Generation (30 minutes)

### AI Tasks (~5 min):
- [ ] Open `templates/script-prompt.md`
- [ ] Fill in this week's details from the calendar
- [ ] Paste the prompt into Claude (any Claude interface works for the script)
- [ ] Wait for the script + beat sheet

### Human Review (~25 min):
- [ ] Read the full script out loud (does it flow naturally?)
- [ ] Check: Is the hook genuinely attention-grabbing?
- [ ] Check: Is the pain point real? Would your actual clients feel this?
- [ ] Check: Are all numbers and data points accurate?
- [ ] Check: Does the twist add genuine insight (not just restate the reveal)?
- [ ] Check: Does the loop seamlessly connect to the hook?
- [ ] Edit for brand voice (consultant, not salesperson)
- [ ] Remove any language that sounds like an ad
- [ ] Save the approved script

### Red Flags (rewrite if you see these):
- ❌ "Don't miss out" or any urgency language
- ❌ Statistics without a source or basis
- ❌ More than one CTA
- ❌ The script sounds like it's selling, not teaching
- ❌ The hook is a question (statements work better for reels)

---

## 🎬 Wednesday — Video Production (45 minutes)

### Setup (~5 min):
- [ ] Open VS Code in the `shorts-creator` folder
- [ ] Start Claude Code (terminal or VS Code extension)
- [ ] Verify `.env` file has your ElevenLabs key

### AI Production (~15 min):
- [ ] Paste the script prompt (from `templates/script-prompt.md`, filled in)
- [ ] Wait for Claude to generate the plan
- [ ] Review the plan before approving build
- [ ] Let Claude build the Remotion composition
- [ ] Wait for voice generation + caption sync
- [ ] Wait for render to complete

### Human Review (~25 min):
- [ ] Watch the full rendered video
- [ ] Check: Does the thumbnail (frame 0) look professional?
- [ ] Check: Are captions synced to spoken words?
- [ ] Check: Is the pacing right? (not too fast, not too slow)
- [ ] Check: Do the animations help explain the concept?
- [ ] Check: Is the color scheme consistent with brand config?
- [ ] Check: Is the audio clear? (voice, music, sound effects balanced)
- [ ] Check: Does the loop work smoothly?
- [ ] If issues: request specific changes from Claude and re-render
- [ ] Save final MP4 to `output/week-[NUMBER]/`

### Common Issues & Fixes:
| Issue | Fix |
|---|---|
| Captions misaligned | Ask Claude to regenerate voice with new timing |
| Animation too fast | Request slower transitions in the beat timing |
| Voice sounds robotic | Try a different ElevenLabs voice or adjust stability |
| Colors wrong | Remind Claude of your brand config colors |
| Loop doesn't work | Ask Claude to match last frame to first frame exactly |

---

## 📱 Thursday — Caption & Copy (20 minutes)

### AI Tasks (~5 min):
- [ ] Open `templates/social-copy-prompt.md`
- [ ] Fill in this week's details
- [ ] Generate Instagram caption
- [ ] Generate YouTube Shorts description
- [ ] (Optional) Generate LinkedIn post

### Human Review (~15 min):
- [ ] Read the Instagram caption — does the first line hook?
- [ ] Check: No salesy language?
- [ ] Check: CTA feels natural?
- [ ] Edit for your personal brand voice
- [ ] Verify hashtags are relevant (not generic)
- [ ] Prepare the video file for each platform
- [ ] Add captions/subtitles if platform doesn't auto-generate

---

## 🚀 Friday — Publish (10 minutes)

### Publishing:
- [ ] Upload to Instagram Reels
  - Best times: 7-9 AM or 12-2 PM in audience timezone
  - Add cover image (frame 0 of the video)
  - Paste caption and hashtags
- [ ] Upload to YouTube Shorts
  - Use the same video file
  - Paste description
  - Add relevant tags
- [ ] (Optional) Upload to LinkedIn
  - Paste the LinkedIn-specific copy
- [ ] Schedule or post immediately based on optimal timing
- [ ] Check that all posts are live and display correctly

### Post-Publish:
- [ ] Reply to any early comments within 1 hour
- [ ] Monitor for the first 2 hours (algorithm boost window)

---

## 📊 Weekend — Analyze (15 minutes, Saturday or Sunday)

### Tasks:
- [ ] Open `templates/analytics-tracker.md`
- [ ] Copy this week's template
- [ ] Fill in all metrics from Instagram Insights
- [ ] Fill in YouTube Shorts analytics
- [ ] Note the best comment or DM received
- [ ] Write 2-3 sentences about what worked and what didn't
- [ ] If a DM came in: respond and track as a lead

### Monthly (Every 4th weekend):
- [ ] Complete the monthly summary section
- [ ] Identify top-performing topic and hypothesize why
- [ ] Review next month's topics — any swaps needed?
- [ ] Check follower growth trend
- [ ] Count total leads generated this month

---

## 🗓️ Quarterly Review (Every 13 weeks)

- [ ] Watch all 13 reels back-to-back
- [ ] Identify the 3 best performers (by engagement + leads)
- [ ] Identify the 3 worst performers
- [ ] Look for patterns: which pain points resonate most?
- [ ] Adjust next quarter's angle based on findings
- [ ] Update brand config if visual style needs refreshing
- [ ] Celebrate wins 🎉
