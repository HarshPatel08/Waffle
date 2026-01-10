# How to Clear Cache in Waffle App

If you're stuck with a cached debug user or old data, here are several ways to clear it:

## Method 1: Use the Clear Cache Button (Easiest)
1. If you can see the welcome screen, tap the **"Clear Cache"** button (red button)
2. This will sign you out and clear all stored user data

## Method 2: Sign Out from Profile Screen
1. Open the app
2. Go to the **Profile** tab (rightmost tab)
3. Scroll down and tap **"Sign Out"**
4. This will clear your session and return you to the welcome screen

## Method 3: Manually Clear Storage (Mobile/Simulator)

### For iOS Simulator:
```bash
# Reset the simulator completely
xcrun simctl erase all
```

Or in the Simulator menu:
1. Device → Erase All Content and Settings

### For Android Emulator:
```bash
# Clear app data
adb shell pm clear host.exp.exponent
```

Or:
1. Settings → Apps → Expo Go → Storage → Clear Data

### For Physical Devices:
1. Delete the Expo Go app
2. Reinstall it from App Store / Play Store

## Method 4: Clear Browser Storage (Web)

### Chrome/Brave:
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Local Storage" → your localhost URL
4. Right-click → Clear
5. Refresh the page

### Safari:
1. Safari → Preferences → Privacy
2. Manage Website Data
3. Remove localhost entries

### Or use browser console:
```javascript
localStorage.removeItem('waffle_user')
location.reload()
```

## Method 5: Auto-Clear Debug Users (Optional)

In `context/AuthContext.tsx`, uncomment these lines (around line 60):

```typescript
// Auto-clear debug users (optional - comment out if you want to keep debug login)
if (user.id?.startsWith('debug-')) {
  console.log('[AUTH] Debug user detected, clearing...');
  await storage.removeItem(USER_STORAGE_KEY);
  return;
}
```

This will automatically clear debug users every time the app loads.

## Verify Cache is Cleared

After clearing cache:
1. Close and reopen the app
2. You should see the welcome screen with "Get Started"
3. No automatic redirect to the tabs screen

## Understanding the Cache

The app stores user data in:
- **Mobile**: Expo SecureStore (encrypted storage)
- **Web**: Browser localStorage

When you use "Skip to App (Debug)", it creates a debug user that persists until manually cleared.
