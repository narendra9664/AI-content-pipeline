# 💬 Slack + GitHub Actions Setup Guide for frontdesk AI

> **Goal:** Automatically generate 1 motion graphic reel per week and post the brief + video download link straight to your Slack channel for **$0.00**.

---

## 💡 How It Works (Simple Analogies)

* **GitHub Actions (The Cloud Robot):** Every Monday morning (or whenever you click "Run Workflow"), GitHub's free cloud computers spin up, create the week's script, generate the AI voice, render the video graphics, and upload the MP4 file.
* **Slack Webhook (The Secret Mailbox):** A unique, secure link provided by Slack. It acts like a digital slot in your door—GitHub drops off the completed video and weekly summary directly into your Slack `#content-reels` channel!

---

## 🛠️ Step 1: Create a Free Slack Webhook (2 Minutes)

1. Open your Slack workspace in your browser or desktop app.
2. Go to **[api.slack.com/apps](https://api.slack.com/apps)** and click **Create New App**.
3. Choose **From scratch**.
4. Set App Name: `frontdesk AI Reels` and select your Slack Workspace.
5. Click **Incoming Webhooks** in the left sidebar, and switch the toggle to **On**.
6. Click **Add New Webhook to Workspace** at the bottom.
7. Select the channel where you want videos delivered (e.g., `#marketing`, `#reels`, or `#general`).
8. Copy your new **Webhook URL** (it looks like `https://hooks.slack.com/services/YOUR_WORKSPACE_ID/YOUR_CHANNEL_ID/YOUR_SECRET_TOKEN`).

---

## 🔒 Step 2: Add Secret to GitHub Repository (1 Minute)

1. Go to your GitHub repository where this project is hosted.
2. Click **Settings** (top bar of your repo).
3. In the left sidebar, expand **Secrets and variables** → click **Actions**.
4. Click the green **New repository secret** button.
5. Set **Name:** `SLACK_WEBHOOK_URL`
6. Set **Secret:** Paste your Webhook URL copied from Step 1.
7. Click **Add secret**.

---

## 🚀 Step 3: Run Your First Test Dispatch

### Option A: Manual Trigger (Test Right Now)
1. In your GitHub repository, click the **Actions** tab at the top.
2. Select **Weekly Video Generation & Slack Dispatch** from the left workflow list.
3. Click **Run workflow** → Select Week `1` → Click the green **Run workflow** button.
4. In under 3 minutes, your cloud robot will process Week 1 and drop a notification with the video link into your Slack channel!

### Option B: Automatic Weekly Schedule
* The workflow is already scheduled to run **every Monday at 09:00 UTC**.
* You don't need to do anything! You'll wake up every Monday morning with your new reel ready in Slack.

---

## 📸 What Your Slack Notification Looks Like

```text
🎬 frontdesk AI — Weekly Motion Reel (Week 1)
--------------------------------------------------
Topic: After-Hours Luxury Lead Loss
Target: Luxury Real Estate Developers

🪝 Hook:
"A $10M buyer requested a tour at 9 PM..."

⚠️ Bottleneck:
Forms sit unread overnight, leading to lost deals.

⚡ AI Solution:
AI instantly qualifies & alerts top agent in 30s.

📢 Call to Action:
"Want 24/7 VIP lead qualification? DM 'SPEED' to frontdesk AI."

--------------------------------------------------
📹 Video File: output/week-1-reel.mp4
Status: Ready for review & publishing on Instagram Reels / LinkedIn!
```
