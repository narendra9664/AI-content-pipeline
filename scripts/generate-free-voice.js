/**
 * Free Voiceover Generator for frontdesk AI
 * Uses edge-tts-node / edge-tts CLI or free Web Speech API fallback
 * Cost: $0.00
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function generateFreeVoice(text, outputFile = 'output/voiceover.mp3', voice = 'en-US-ChristopherNeural') {
  console.log(`🎙️  Generating free AI voiceover for frontdesk AI...`);
  console.log(`🗣️  Voice: ${voice}`);
  console.log(`📝  Text: "${text.substring(0, 60)}..."`);

  // Ensure output folder exists
  const outDir = path.dirname(outputFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    // Attempt edge-tts via npx (requires python edge-tts or node edge-tts-cli)
    const cmd = `npx -y edge-tts-cli --text "${text.replace(/"/g, '\\"')}" --voice "${voice}" --write-media "${outputFile}"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅  Voiceover saved to: ${outputFile}`);
  } catch (err) {
    console.log(`⚠️  Could not run edge-tts-cli directly. You can run it manually via python or install edge-tts:`);
    console.log(`   pip install edge-tts`);
    console.log(`   edge-tts --text "${text}" --voice "${voice}" --write-media "${outputFile}"`);
  }
}

// Handle command line invocation
if (require.main === module) {
  const args = process.argv.slice(2);
  let text = "A 10 million dollar penthouse buyer filled your form at 9 PM. By 9:05 PM, they bought from your competitor.";
  let out = "output/voiceover.mp3";
  let voice = "en-US-ChristopherNeural";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--text' && args[i + 1]) text = args[i + 1];
    if (args[i] === '--out' && args[i + 1]) out = args[i + 1];
    if (args[i] === '--voice' && args[i + 1]) voice = args[i + 1];
  }

  generateFreeVoice(text, out, voice);
}

module.exports = { generateFreeVoice };
