# Backend Testing Guide

## Setup

### 1. Create `.env` file
Create a `.env` file in the `waffle` directory with your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/waffle
# OR for MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waffle

PORT=3001
```

### 2. Start the Server
```bash
npm run server
```

You should see:
```
Server running on port 3001
MongoDB Connected: ...
```

## Testing Endpoints

### Health Check
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","message":"Waffle API is running"}
```

### Create Account (Signup)
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "emoji": "😎"
  }'
```

Expected response (success):
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "emoji": "😎"
  }
}
```

### Sign In
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Expected response (success):
```json
{
  "success": true,
  "message": "Signed in successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "emoji": "😎"
  }
}
```

### Test Error Cases

**Duplicate Email:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Invalid Password:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "short"
  }'
```

## Check Database Directly

### Using MongoDB Shell
```bash
mongosh
use waffle
db.users.find().pretty()
```

### Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to your MongoDB URI
3. Navigate to `waffle` database
4. View `users` collection

## Using the Test Script

Run the included test script:
```bash
node server/test-api.js
```

This will test all endpoints automatically.

## Troubleshooting

**Server won't start:**
- Check if port 3001 is already in use
- Verify `.env` file exists and has `MONGODB_URI`
- Make sure MongoDB is running

**MongoDB connection error:**
- Verify MongoDB is running: `mongosh --version`
- Check connection string in `.env`
- For local MongoDB: `mongodb://localhost:27017/waffle`
- For Atlas: Make sure IP is whitelisted

**Accounts not appearing:**
- Check server logs for errors
- Verify MongoDB connection succeeded
- Check if you're looking at the correct database
