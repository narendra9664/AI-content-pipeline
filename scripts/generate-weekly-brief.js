/**
 * Weekly Brief Generator
 * 
 * Run this every Monday to see this week's topic and get the 
 * ready-to-paste prompt for video production.
 * 
 * Usage: node scripts/generate-weekly-brief.js
 * 
 * Optional: node scripts/generate-weekly-brief.js --week 5
 * (to preview a specific week)
 */

const fs = require('fs');
const path = require('path');

// Load the topic calendar
const calendarPath = path.join(__dirname, '..', 'calendar', 'topics.json');
const brandPath = path.join(__dirname, '..', 'brand', 'config.json');

let topics, brand;

try {
  topics = JSON.parse(fs.readFileSync(calendarPath, 'utf8'));
} catch (e) {
  console.error('❌ Could not load calendar/topics.json');
  console.error('   Make sure you\'re running this from the project root.');
  process.exit(1);
}

try {
  brand = JSON.parse(fs.readFileSync(brandPath, 'utf8'));
} catch (e) {
  console.error('❌ Could not load brand/config.json');
  process.exit(1);
}

// Determine which week to show
let weekNumber;
const weekArg = process.argv.indexOf('--week');
if (weekArg !== -1 && process.argv[weekArg + 1]) {
  weekNumber = parseInt(process.argv[weekArg + 1]);
} else {
  // Calculate current week of the year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  weekNumber = Math.ceil(diff / oneWeek);
  // Wrap around if past week 52
  if (weekNumber > 52) weekNumber = ((weekNumber - 1) % 52) + 1;
}

const topic = topics.find(t => t.week === weekNumber);

if (!topic) {
  console.error(`❌ No topic found for week ${weekNumber}`);
  process.exit(1);
}

// Display the brief
const divider = '═'.repeat(60);
const thinDivider = '─'.repeat(60);

console.log('');
console.log(divider);
console.log(`  📅 WEEKLY BRIEF — WEEK ${topic.week}`);
console.log(`  📋 Quarter ${topic.quarter}: ${topic.quarter_theme}`);
console.log(divider);
console.log('');
console.log(`  📌 TOPIC:      ${topic.topic}`);
console.log(`  🎣 HOOK:       "${topic.hook}"`);
console.log(`  💢 PAIN POINT: ${topic.pain_point}`);
console.log(`  🎨 VISUAL:     ${topic.visual_description}`);
console.log(`  📢 CTA TYPE:   ${topic.cta_type}`);
console.log(`  📢 CTA:        "${topic.cta}"`);
console.log('');
console.log(thinDivider);
console.log('  🎬 THE 6-BEAT SCRIPT');
console.log(thinDivider);
console.log('');
console.log(`  Beat 1 (HOOK, 0-3s):`);
console.log(`  "${topic.beat_1_hook}"`);
console.log('');
console.log(`  Beat 2 (SETUP, 3-10s):`);
console.log(`  "${topic.beat_2_setup}"`);
console.log('');
console.log(`  Beat 3 (QUIZ, 10-18s):`);
console.log(`  "${topic.beat_3_quiz}"`);
console.log('');
console.log(`  Beat 4 (REVEAL, 18-28s):`);
console.log(`  "${topic.beat_4_reveal}"`);
console.log('');
console.log(`  Beat 5 (TWIST, 28-36s):`);
console.log(`  "${topic.beat_5_twist}"`);
console.log('');
console.log(`  Beat 6 (LOOP, 36-40s):`);
console.log(`  "${topic.beat_6_loop}"`);
console.log('');
console.log(divider);
console.log('  📋 READY-TO-PASTE PROMPT (for Claude Code)');
console.log(divider);
console.log('');

// Generate the ready-to-paste prompt
const prompt = `Make a short about ${topic.topic.toLowerCase()} for luxury real estate developers.

CONTEXT:
${brand.brand.service}. Target audience: ${brand.brand.niche} selling $2M+ properties.

BRAND IDENTITY:
- Dark background (${brand.visual_identity.background})
- Primary accent: ${brand.visual_identity.primary_color_name} (${brand.visual_identity.primary_color})
- Secondary accent: ${brand.visual_identity.secondary_color_name} (${brand.visual_identity.secondary_color})
- Typography: Clean sans-serif, bold headlines
- Style: Animated infographics, data visualizations, flow diagrams
- Tone: Educational authority — teach, don't sell

THE HOOK:
"${topic.hook}"

THE PAIN POINT:
${topic.pain_point}

VISUAL STYLE:
${topic.visual_description}. Dark background, ${brand.visual_identity.primary_color_name.toLowerCase()} and ${brand.visual_identity.secondary_color_name.toLowerCase()} accents. Premium, data-driven, authoritative.

THE 6-BEAT STRUCTURE:
Beat 1 (HOOK, 0-3s): "${topic.beat_1_hook}"
Beat 2 (SETUP, 3-10s): "${topic.beat_2_setup}"
Beat 3 (QUIZ, 10-18s): "${topic.beat_3_quiz}"
Beat 4 (REVEAL, 18-28s): "${topic.beat_4_reveal}"
Beat 5 (TWIST, 28-36s): "${topic.beat_5_twist}"
Beat 6 (LOOP, 36-40s): "${topic.beat_6_loop}"

RULES:
- Frame 0 IS the thumbnail. Make it visually striking.
- The last frame must seamlessly loop back to frame 0.
- Use word-synced captions (built-in feature).
- Include subtle sound effects for data reveals and transitions.
- No engagement-bait outros ("like and subscribe").
- Keep voiceover pace conversational — not rushed.
- End with quiet confidence, not a hard sell.
- Use ElevenLabs voice: ${brand.voice_settings.voice_name} (${brand.voice_settings.voice_id})`;

console.log(prompt);
console.log('');
console.log(divider);
console.log('');
console.log('  📁 Copy the prompt above and paste it into Claude Code');
console.log(`  📁 Output will go to: output/week-${String(topic.week).padStart(2, '0')}/`);
console.log('');

// Save the prompt to a file for easy access
const outputDir = path.join(__dirname, '..', 'output', `week-${String(topic.week).padStart(2, '0')}`);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const promptFile = path.join(outputDir, 'prompt.txt');
fs.writeFileSync(promptFile, prompt, 'utf8');
console.log(`  ✅ Prompt saved to: output/week-${String(topic.week).padStart(2, '0')}/prompt.txt`);
console.log('');
