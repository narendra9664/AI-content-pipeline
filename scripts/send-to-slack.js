/**
 * Slack Notification Dispatcher for frontdesk AI
 * Posts weekly video brief, hook, bottleneck, CTA, and video download links to Slack.
 * Cost: $0.00
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

function sendToSlack(options = {}) {
  const weekNum = options.week || 1;
  const videoFile = options.video || `output/week-${weekNum}-reel.mp4`;

  // 1. Load brand config & topic data
  const brandPath = path.join(__dirname, '../brand/config.json');
  const topicsPath = path.join(__dirname, '../calendar/topics.json');

  let brand = { name: "frontdesk AI", website: "https://yourdomain.com" };
  let topic = {
    week: weekNum,
    title: "After-Hours Luxury Lead Loss",
    hook: "A $10M buyer requested a tour at 9 PM...",
    problem: "Forms sit unread overnight, leading to lost deals.",
    solution: "AI instantly qualifies & alerts top agent in 30s.",
    cta: "Want 24/7 VIP lead qualification? DM 'SPEED' to frontdesk AI."
  };

  if (fs.existsSync(brandPath)) {
    try {
      const bData = JSON.parse(fs.readFileSync(brandPath, 'utf8'));
      brand = bData.brand || brand;
    } catch (e) {}
  }

  if (fs.existsSync(topicsPath)) {
    try {
      const tData = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
      const found = tData.find(t => t.week === parseInt(weekNum));
      if (found) {
        topic = {
          week: found.week || weekNum,
          title: found.topic || found.title || "Weekly Motion Reel",
          hook: found.hook || "",
          problem: found.pain_point || found.problem || "",
          solution: found.solution || "AI lead qualification & instant routing system.",
          cta: found.cta || "DM 'SPEED' to frontdesk AI."
        };
      }
    } catch (e) {}
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  console.log(`\n==================================================`);
  console.log(`🚀 Dispatching Reel Notification to Slack...`);
  console.log(`🏷️ Agency: ${brand.name}`);
  console.log(`📅 Week: ${topic.week} - ${topic.title}`);
  console.log(`==================================================\n`);

  // 2. Build Slack Block Kit Message
  const slackPayload = {
    text: `🎬 *New Weekly Reel Ready:* ${topic.title} (Week ${topic.week})`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🎬 ${brand.name} — Weekly Motion Reel (Week ${topic.week})`,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Topic:* ${topic.title}\n*Target:* Luxury Real Estate Developers`
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*🪝 Hook:*\n"${topic.hook}"`
          },
          {
            type: "mrkdwn",
            text: `*⚠️ Bottleneck:*\n${topic.problem}`
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*⚡ AI Solution:*\n${topic.solution}`
          },
          {
            type: "mrkdwn",
            text: `*📢 Call to Action:*\n"${topic.cta}"`
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `📹 *Video File:* \`${videoFile}\`\n\n*Status:* Ready for review & publishing on Instagram Reels / LinkedIn!`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Automated by *GitHub Actions* for *${brand.name}* | $0.00 Pipeline`
          }
        ]
      }
    ]
  };

  // 3. Send Payload or Dry-Run
  if (!webhookUrl) {
    console.log(`⚠️ SLACK_WEBHOOK_URL environment variable is not set.`);
    console.log(`ℹ️ Showing preview of formatted Slack notification below:\n`);
    console.log(JSON.stringify(slackPayload, null, 2));
    console.log(`\n👉 To post directly to Slack, add SLACK_WEBHOOK_URL to your GitHub Repo Secrets or environment.`);
    return;
  }

  try {
    const urlObj = new URL(webhookUrl);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Successfully delivered video brief & notification to Slack!`);
        } else {
          console.error(`❌ Slack API returned status ${res.statusCode}: ${body}`);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Error sending request to Slack: ${e.message}`);
    });

    req.write(JSON.stringify(slackPayload));
    req.end();

  } catch (err) {
    console.error(`❌ Invalid Webhook URL format: ${err.message}`);
  }
}

// Handle command line invocation
if (require.main === module) {
  const args = process.argv.slice(2);
  let week = 1;
  let video = 'output/week-1-reel.mp4';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--week' && args[i + 1]) week = parseInt(args[i + 1]);
    if (args[i] === '--video' && args[i + 1]) video = args[i + 1];
  }

  sendToSlack({ week, video });
}

module.exports = { sendToSlack };
