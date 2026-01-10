# Waffle App Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Make sure `.env` file exists with:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3001
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start the Backend Server
**IMPORTANT:** The server must be running for user signup/signin to work!

In one terminal:
```bash
npm run server
```

You should see:
```
[DB] Connecting to MongoDB...
[DB] MongoDB Connected: ...
Server running on port 3001
```

### 4. Start the Expo App
In a **separate** terminal:
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

## User Creation Flow

1. Complete onboarding steps (name, email, password)
2. Pick an emoji avatar
3. Review your details
4. Click "Create Account"
5. Account is created in MongoDB via the backend API
6. Redirected to main app

## Troubleshooting

### "Cannot connect to server" error
- Make sure the backend server is running (`npm run server`)
- Check that `EXPO_PUBLIC_API_URL` is set correctly in `.env`
- Verify MongoDB connection is working

### User creation fails
- Check server logs in the terminal running `npm run server`
- Ensure MongoDB is accessible
- Verify all required fields are filled

## Database

Users are stored in MongoDB with:
- Name
- Email (unique)
- Password (hashed with bcrypt)
- Emoji avatar

## API Endpoints

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Sign in existing user
- `GET /api/health` - Health check
