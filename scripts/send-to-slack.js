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
  const botToken = process.env.SLACK_BOT_TOKEN;

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
            text: `Automated by *GitHub Actions* for *${brand.name}* | Every Monday at 8:00 AM IST`
          }
        ]
      }
    ]
  };

  // 3. Optional Direct Bot Token Upload if SLACK_BOT_TOKEN is present
  if (botToken && fs.existsSync(videoFile)) {
    console.log(`📡 Uploading MP4 file directly via Slack Bot Token using modern Slack API...`);
    try {
      const fileBuffer = fs.readFileSync(videoFile);
      const filename = path.basename(videoFile);
      const fileSize = fileBuffer.length;
      const channelId = process.env.SLACK_CHANNEL_ID;

      const getUrlReq = https.request({
        hostname: 'slack.com',
        path: `/api/files.getUploadURLExternal?filename=${encodeURIComponent(filename)}&length=${fileSize}`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${botToken}`
        }
      }, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (!data.ok || !data.upload_url) {
              console.error(`❌ Slack getUploadURLExternal error:`, body);
              return;
            }

            const urlObj = new URL(data.upload_url);
            const uploadReq = https.request({
              hostname: urlObj.hostname,
              path: urlObj.pathname + urlObj.search,
              method: 'POST',
              headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': fileSize
              }
            }, upRes => {
              let upBody = '';
              upRes.on('data', c => upBody += c);
              upRes.on('end', () => {
                const completePayload = JSON.stringify({
                  files: [{ id: data.file_id, title: `${brand.name} — Week ${topic.week} Video` }],
                  channel_id: channelId || undefined,
                  initial_comment: `🎬 *${brand.name} — Week ${topic.week} Video Reel Attached Below!*`
                });

                const completeReq = https.request({
                  hostname: 'slack.com',
                  path: '/api/files.completeUploadExternal',
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${botToken}`,
                    'Content-Type': 'application/json; charset=utf-8'
                  }
                }, compRes => {
                  let compBody = '';
                  compRes.on('data', c => compBody += c);
                  compRes.on('end', () => {
                    console.log(`✅ Direct MP4 Upload Complete:`, compBody);
                  });
                });

                completeReq.write(completePayload);
                completeReq.end();
              });
            });

            uploadReq.write(fileBuffer);
            uploadReq.end();

          } catch (e) {
            console.error(`❌ Upload parsing error: ${e.message}`);
          }
        });
      });

      getUrlReq.end();
    } catch (e) {
      console.error(`❌ Failed file upload: ${e.message}`);
    }
  }

  // 4. Send Webhook Notification Payload
  if (!webhookUrl) {
    console.log(`⚠️ SLACK_WEBHOOK_URL environment variable is not set.`);
    console.log(`ℹ️ Showing preview of formatted Slack notification below:\n`);
    console.log(JSON.stringify(slackPayload, null, 2));
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
