# MongoDB Access Guide - How to View Your Database

## Option 1: MongoDB Compass (Recommended - GUI Tool) 🎨

MongoDB Compass is a visual tool that makes it easy to browse and query your database.

### Installation

**Windows:**
1. Download MongoDB Compass from: https://www.mongodb.com/try/download/compass
2. Choose the Windows installer (.msi file)
3. Run the installer and follow the setup wizard
4. Launch MongoDB Compass

**Alternative: Install via Chocolatey (if you have it):**
```powershell
choco install mongodb-compass
```

### Connecting to MongoDB

#### If using Local MongoDB (on your laptop):
```
mongodb://localhost:27017
```
- Click "Fill in connection fields individually"
- Host: `localhost`
- Port: `27017`
- Click "Connect"

#### If using MongoDB Atlas (Cloud):
1. Go to https://cloud.mongodb.com
2. Sign in to your account
3. Click "Connect" on your cluster
4. Choose "Connect using MongoDB Compass"
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Paste it into Compass and click "Connect"

#### Finding Your Connection String (From Your Code):
Check your `.env` file in the `waffle` folder - it should have:
```
MONGODB_URI=mongodb://...
```
Use that same connection string in Compass!

### Using Compass
- Browse databases on the left sidebar
- Click on a database (like `waffle`) to see collections
- Click on a collection (like `users`) to see documents
- You can:
  - View all documents
  - Search/filter documents
  - Edit documents
  - Add/delete documents
  - See indexes

---

## Option 2: MongoDB Shell (mongosh) - Command Line 🔧

### Installation

**Windows:**
1. Download MongoDB Shell from: https://www.mongodb.com/try/download/shell
2. Choose Windows x64 installer
3. Run the installer
4. Open PowerShell or Command Prompt

**Or install via Chocolatey:**
```powershell
choco install mongosh
```

**Or install via npm (if you have Node.js):**
```bash
npm install -g mongosh
```

### Connecting to MongoDB

#### Local MongoDB:
```bash
mongosh
```
This automatically connects to `mongodb://localhost:27017`

#### MongoDB Atlas:
```bash
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/"
```

#### Custom Connection:
```bash
mongosh "mongodb://localhost:27017/waffle"
```

### Basic Commands

Once connected, try these commands:

```javascript
// Show all databases
show dbs

// Switch to your database (usually 'waffle')
use waffle

// Show all collections (tables)
show collections

// View all users
db.users.find()

// Pretty print (easier to read)
db.users.find().pretty()

// Find specific user by email
db.users.findOne({ email: "john@example.com" })

// Count documents
db.users.countDocuments()

// Find users and show only name and email
db.users.find({}, { name: 1, email: 1, emoji: 1 })

// Exit
exit
```

---

## Option 3: VS Code Extension (If you use VS Code) 📝

### Installation
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "MongoDB for VS Code"
4. Install the extension by MongoDB
5. Reload VS Code

### Connecting
1. Click the MongoDB icon in the left sidebar
2. Click "Add Connection"
3. Paste your connection string (same as Compass)
4. Give it a name (e.g., "Waffle Database")
5. Click "Connect"

### Using It
- Browse databases and collections in the sidebar
- Right-click a collection → "View Documents"
- Query documents using MongoDB queries
- Edit/delete documents directly

---

## Option 4: Web Browser (Only for MongoDB Atlas) 🌐

If you're using MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Sign in
3. Click "Browse Collections" on your cluster
4. View your data directly in the browser

---

## Finding Your Connection Details

### Check Your Project Files

1. **Check `.env` file** (in `waffle` folder):
   ```bash
   # Look for:
   MONGODB_URI=mongodb://...
   ```

2. **Check server logs** when you run `npm run server`:
   ```
   MongoDB Connected: ...
   ```

3. **If using MongoDB Atlas:**
   - Go to https://cloud.mongodb.com
   - Your clusters are listed there
   - Click "Connect" to get connection strings

---

## Quick Troubleshooting

**"Connection refused" or "Cannot connect":**
- **Local MongoDB**: Make sure MongoDB service is running
  ```powershell
  # Check if running
  Get-Service MongoDB
  
  # Start if not running (requires admin)
  Start-Service MongoDB
  ```

- **MongoDB Atlas**: 
  - Make sure your IP address is whitelisted (Network Access)
  - Check username/password are correct
  - Verify connection string is correct

**"Authentication failed":**
- Check username/password in connection string
- For Atlas: Make sure database user exists and has correct permissions

**"Database not found":**
- It's okay! MongoDB creates databases automatically when you first write to them
- Create a user via your app signup, then the database will appear

---

## Recommended Workflow

1. **Start with MongoDB Compass** (easiest visual tool)
2. **Use mongosh** for quick queries or automation
3. **Use VS Code extension** if you're already in VS Code

---

## Example: Viewing Your Waffle Users

Once connected, here's what you'll see:

```javascript
// In mongosh or Compass query:
use waffle
db.users.find().pretty()

// Example output:
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  emoji: "😎",
  groups: [],
  createdAt: ISODate("2024-..."),
  updatedAt: ISODate("2024-...")
}
```

---

## Security Note 🔒

- **Never commit `.env` files** to Git (already in .gitignore)
- **Never share connection strings** publicly
- **Use strong passwords** for database users
- **Restrict IP access** in MongoDB Atlas to only your IPs when possible
