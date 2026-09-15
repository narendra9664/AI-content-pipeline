/**
 * Topic Picker — Browse and preview any week's content
 * 
 * Usage: 
 *   node scripts/topic-picker.js              (shows all topics)
 *   node scripts/topic-picker.js --quarter 1  (shows Q1 only)
 *   node scripts/topic-picker.js --week 5     (shows week 5 details)
 *   node scripts/topic-picker.js --search "lead"  (search topics)
 */

const fs = require('fs');
const path = require('path');

const calendarPath = path.join(__dirname, '..', 'calendar', 'topics.json');
let topics;

try {
  topics = JSON.parse(fs.readFileSync(calendarPath, 'utf8'));
} catch (e) {
  console.error('❌ Could not load calendar/topics.json');
  process.exit(1);
}

const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const quarterFilter = getArg('--quarter');
const weekFilter = getArg('--week');
const searchFilter = getArg('--search');

const divider = '═'.repeat(70);
const thinDivider = '─'.repeat(70);

// Show detailed view for a single week
if (weekFilter) {
  const week = parseInt(weekFilter);
  const topic = topics.find(t => t.week === week);
  
  if (!topic) {
    console.error(`❌ No topic found for week ${week}`);
    process.exit(1);
  }
  
  console.log('');
  console.log(divider);
  console.log(`  WEEK ${topic.week} — ${topic.topic}`);
  console.log(`  Quarter ${topic.quarter}: ${topic.quarter_theme}`);
  console.log(divider);
  console.log('');
  console.log(`  Hook:       "${topic.hook}"`);
  console.log(`  Pain Point: ${topic.pain_point}`);
  console.log(`  Visual:     ${topic.visual_description}`);
  console.log(`  CTA (${topic.cta_type}): "${topic.cta}"`);
  console.log('');
  console.log(thinDivider);
  console.log('  SCRIPT');
  console.log(thinDivider);
  console.log(`  [0-3s]   ${topic.beat_1_hook}`);
  console.log(`  [3-10s]  ${topic.beat_2_setup}`);
  console.log(`  [10-18s] ${topic.beat_3_quiz}`);
  console.log(`  [18-28s] ${topic.beat_4_reveal}`);
  console.log(`  [28-36s] ${topic.beat_5_twist}`);
  console.log(`  [36-40s] ${topic.beat_6_loop}`);
  console.log('');
  process.exit(0);
}

// Search topics
if (searchFilter) {
  const query = searchFilter.toLowerCase();
  const matches = topics.filter(t => 
    t.topic.toLowerCase().includes(query) ||
    t.hook.toLowerCase().includes(query) ||
    t.pain_point.toLowerCase().includes(query)
  );
  
  if (matches.length === 0) {
    console.log(`\n  No topics matching "${searchFilter}"\n`);
    process.exit(0);
  }
  
  console.log(`\n  Found ${matches.length} topics matching "${searchFilter}":\n`);
  matches.forEach(t => {
    console.log(`  Week ${String(t.week).padStart(2, ' ')} │ Q${t.quarter} │ ${t.hook}`);
  });
  console.log('');
  process.exit(0);
}

// Show all topics (optionally filtered by quarter)
let filtered = topics;
if (quarterFilter) {
  const q = parseInt(quarterFilter);
  filtered = topics.filter(t => t.quarter === q);
}

let currentQuarter = null;

console.log('');
console.log(divider);
console.log('  📅 52-WEEK CONTENT CALENDAR');
console.log('  AI-in-Business Reels for Luxury Real Estate Developers');
console.log(divider);
console.log('');

filtered.forEach(t => {
  if (t.quarter !== currentQuarter) {
    currentQuarter = t.quarter;
    console.log(thinDivider);
    console.log(`  QUARTER ${t.quarter}: ${t.quarter_theme}`);
    console.log(thinDivider);
  }
  
  const weekStr = String(t.week).padStart(2, ' ');
  const ctaIcon = t.cta_type === 'direct' ? '🔴' : '🟢';
  console.log(`  Week ${weekStr} │ ${ctaIcon} │ "${t.hook}"`);
});

console.log('');
console.log('  Legend: 🟢 = soft CTA  🔴 = direct CTA');
console.log('');
console.log('  Use --week N for details, --search "keyword" to find topics');
console.log('');
