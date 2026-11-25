🧇 Waffle

Share moments now. Relive them later.

Waffle turns instant messaging into a digital time capsule. Record short video messages for your groups of friends, have them delivered on a schedule, and let AI recap everyone's week.

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Cloud-Storage-4285F4?logo=googlecloud&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Google_Gemini-8E75B2?logo=googlegemini&logoColor=white" />
</p>

📖 About

Group chats bury the moments that matter. Waffle lets you capture and share life updates with your friends through video, making it easier to keep up with everyone and look back on memories.

With Waffle, you can:

Record a 1–2 minute video vlog of your life update, whether daily, weekly, or monthly.

Share it with a group of friends, where replies are vlogs too. No typing required.

Relive it later with AI-generated recaps that turn everyone's vlogs into themed weekly or monthly summaries.

Built during a 24-hour hackathon, Waffle consists of a React Native (Expo) mobile app and a Node.js/Express backend. Videos are stored in Google Cloud Storage, metadata is managed through MongoDB, and Google Gemini powers prompts and AI-generated recaps.

✨ Features

🎥 Video-first messaging — Record and watch videos directly in the app. No text messages.

👥 Private groups — Create groups with custom names, emojis, and members. Join or leave groups freely.

✉️ Group invitations — Invite users and accept or decline requests through the Requests screen.

⏰ Scheduled delivery & reminders — Set group notification schedules to remind everyone when it's time to vlog.

💡 Vlog prompts — Use prompts to guide each vlog, including AI-generated prompts from Gemini.

🤖 AI recaps — Generate themed summaries of group vlogs using Gemini (gemini-2.0-flash).

❤️ Reactions & view tracking — React with emojis like ❤️, 🔥, 😂, and 💀, and see who has watched each vlog.

🔐 Authentication — Email/password accounts, emoji avatars, bcrypt-hashed passwords, and securely stored tokens using Expo Secure Store.

🛠️ Tech Stack

Category

Technologies

Mobile App

React Native 0.81, Expo SDK 54, Expo Router, TypeScript

Mobile APIs

expo-camera, expo-video, expo-notifications

Backend

Node.js, Express 5, Mongoose, bcryptjs

Database

MongoDB (users, groups, vlogs, invitations)

Video Storage

Google Cloud Storage (signed upload URLs)

AI

Google Gemini (@google/generative-ai)
