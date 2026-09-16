/**
 * Free Voiceover Generator for frontdesk AI
 * Tries multiple free TTS engines in order:
 *   1. Python edge-tts (most reliable, installed via pip)
 *   2. npx edge-tts-cli (Node wrapper)
 *   3. Generates a silent placeholder as last resort
 * Cost: $0.00
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function generateFreeVoice(text, outputFile = 'output/voiceover.mp3', voice = 'en-US-ChristopherNeural') {
  console.log(`🎙️  Generating free AI voiceover for frontdesk AI...`);
  console.log(`🗣️  Voice: ${voice}`);
  console.log(`📝  Text: "${text.substring(0, 80)}..."`);

  // Ensure output folder exists
  const outDir = path.dirname(outputFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Clean up any previous placeholder/invalid file
  if (fs.existsSync(outputFile)) {
    const size = fs.statSync(outputFile).size;
    if (size < 1000) {
      console.log(`⚠️  Removing invalid previous file (${size} bytes — too small to be real audio)`);
      fs.unlinkSync(outputFile);
    }
  }

  // Escape text for shell commands (handle quotes and special chars)
  const safeText = text.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');

  let success = false;

  // ── Attempt 1: Python edge-tts (most reliable) ──
  if (!success) {
    try {
      console.log(`\n🔄  Attempt 1: Python edge-tts...`);
      const cmd = `edge-tts --text "${safeText}" --voice "${voice}" --write-media "${outputFile}"`;
      execSync(cmd, { stdio: 'inherit', timeout: 60000 });
      if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 1000) {
        success = true;
        console.log(`✅  Python edge-tts succeeded!`);
      }
    } catch (err) {
      console.log(`⚠️  Python edge-tts failed: ${err.message}`);
    }
  }

  // ── Attempt 2: Python3 edge-tts (some systems use python3) ──
  if (!success) {
    try {
      console.log(`\n🔄  Attempt 2: python3 -m edge_tts...`);
      const cmd = `python3 -m edge_tts --text "${safeText}" --voice "${voice}" --write-media "${outputFile}"`;
      execSync(cmd, { stdio: 'inherit', timeout: 60000 });
      if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 1000) {
        success = true;
        console.log(`✅  python3 edge_tts succeeded!`);
      }
    } catch (err) {
      console.log(`⚠️  python3 edge_tts failed: ${err.message}`);
    }
  }

  // ── Attempt 3: python -m edge_tts (Windows often uses 'python') ──
  if (!success) {
    try {
      console.log(`\n🔄  Attempt 3: python -m edge_tts...`);
      const cmd = `python -m edge_tts --text "${safeText}" --voice "${voice}" --write-media "${outputFile}"`;
      execSync(cmd, { stdio: 'inherit', timeout: 60000 });
      if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 1000) {
        success = true;
        console.log(`✅  python edge_tts succeeded!`);
      }
    } catch (err) {
      console.log(`⚠️  python edge_tts failed: ${err.message}`);
    }
  }

  // ── Attempt 4: npx edge-tts-cli (Node wrapper) ──
  if (!success) {
    try {
      console.log(`\n🔄  Attempt 4: npx edge-tts-cli...`);
      const cmd = `npx -y edge-tts-cli --text "${safeText}" --voice "${voice}" --write-media "${outputFile}"`;
      execSync(cmd, { stdio: 'inherit', timeout: 120000 });
      if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 1000) {
        success = true;
        console.log(`✅  npx edge-tts-cli succeeded!`);
      }
    } catch (err) {
      console.log(`⚠️  npx edge-tts-cli failed: ${err.message}`);
    }
  }

  // ── Final validation ──
  if (success && fs.existsSync(outputFile)) {
    const fileSize = fs.statSync(outputFile).size;
    console.log(`\n✅  Voiceover saved to: ${outputFile}`);
    console.log(`📦  File size: ${(fileSize / 1024).toFixed(1)} KB`);
    return true;
  }

  // ── All attempts failed ──
  console.error(`\n❌  ALL voice generation methods failed.`);
  console.error(`\n📋  To fix this, install edge-tts manually:`);
  console.error(`    pip install edge-tts`);
  console.error(`\n    Then run:`);
  console.error(`    edge-tts --text "${text.substring(0, 40)}..." --voice "${voice}" --write-media "${outputFile}"`);

  // Create a marker file so the pipeline knows voice gen failed
  // (NOT a fake mp3 — an explicit error marker)
  const errorMarker = outputFile + '.error';
  fs.writeFileSync(errorMarker, `Voice generation failed at ${new Date().toISOString()}\nText: ${text}\nVoice: ${voice}\n`, 'utf8');
  console.error(`\n⚠️  Error marker written to: ${errorMarker}`);

  return false;
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

  const ok = generateFreeVoice(text, out, voice);
  if (!ok) {
    // Exit with code 1 so the pipeline knows this step failed
    process.exit(1);
  }
}

module.exports = { generateFreeVoice };
