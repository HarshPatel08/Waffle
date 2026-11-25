🧇 Waffle
Share moments now. Relive them later.
Waffle turns instant messaging into a digital time capsule. Record short video messages for your groups of friends, have them delivered on a schedule, and let AI recap everyone's week.
!React Native
!Expo
!MongoDB
!Google Cloud
!Gemini
</div>

📖 About
Group chats bury the moments that matter. In Waffle you:
Record a 1–2 minute video vlog of your life update — daily, weekly, or monthly
Post it to a group of friends — replies are vlogs too, there's no typing
Relive it later — AI recaps everyone's vlogs into a themed weekly/monthly summary
Built as a 24-hour hackathon project: React Native (Expo) app + Node.js/Express API. Videos are stored in Google Cloud Storage, metadata in MongoDB, and Google Gemini powers the prompts and recaps.
✨ Features
🎥 Video-first messaging — in-app camera recording and playback, video only
👥 Private groups — create groups with names, emojis, and member lists; join/leave freely
✉️ Invitations — invite users to groups; accept/decline from the Requests screen
⏰ Scheduled delivery & reminders — per-group notification schedules so nobody misses vlog day
💡 Prompts — every vlog can be anchored to a prompt, including Gemini-generated ones
🤖 AI recaps — Gemini (gemini-2.0-flash) writes a themed recap of the group's vlogs
❤️ Reactions & view tracking — like/fire/heart/skull/laughing reactions, plus who's watched
🔐 Accounts — email/password sign-up with emoji avatars; bcrypt-hashed passwords, tokens in Secure Store
🛠️ Tech Stack
App: React Native 0.81 · Expo SDK 54 · Expo Router · TypeScript · expo-camera/video/notifications
Backend: Node.js · Express 5 · Mongoose · bcryptjs
Data: MongoDB (users, groups, vlogs, invitations) · Google Cloud Storage (videos, via signed upload URLs)
AI: Google Gemini (@google/generative-ai)
How uploads work: the app asks the API for a signed URL, uploads the video straight to Google Cloud Storage, then saves the vlog's metadata (GCS path, duration, prompt) to MongoDB.
🚀 Getting Started
git clone https://github.com/HarshPatel08/Waffle.git
cd Waffle/waffle
npm install
Create a .env in waffle/:
MONGODB_URI=your_mongodb_connection_string
PORT=3001
GCS_BUCKET_NAME=waffle-user-videos-uscentral
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_GEMINI_API_KEY=<redacted>
⚠️ Never commit real keys or the keys/gcs-sa.json service-account file to the repo.
npm run server   # Terminal 1 — API on port 3001
npm start        # Terminal 2 — Expo (press i / a, or scan the QR code)
On a physical device, set EXPO_PUBLIC_API_URL to your computer's LAN IP, not localhost.
📁 Structure
app/         Expo Router screens (tabs, onboarding, groups, requests, record)
components/  Themed UI components
context/     Auth & onboarding state
services/    API client + GCS upload
server/      Express API — models/ (User, Group, Vlog, GroupInvitation), routes/ (auth, users, groups, vlogs, invitations)
🔌 API
Base: http://localhost:3001/api
Auth: POST /auth/signup · POST /auth/signin
Groups: POST /groups · GET /groups/user/:userId · POST /groups/:groupId/join|leave
Invitations: POST /invitations/create · GET /invitations/pending/:userId · POST /invitations/respond
Vlogs: POST /vlogs/upload-url · POST /vlogs · GET /vlogs/group/:groupId · GET /vlogs/watch/:vlogId · POST /vlogs/:vlogId/react · DELETE /vlogs/:vlogId
More detail in SETUP.md and BACKEND_TESTING.md.
👤 Author
Harsh Patel — @HarshPatel08
<div align="center">Made with 🧇 and far too little sleep (24-hour hackathon).</div>
