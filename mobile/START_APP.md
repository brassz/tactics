# How to Start Your App

## ✅ The TurboModuleRegistry Error Has Been Fixed!

Your app is now ready to run. All package versions have been aligned with Expo SDK 54.

## Quick Start

### 1. The Development Server is Already Running! 🎉

The Metro bundler is currently running in the background. You can now:

**For Physical Device (Recommended for testing native features):**
1. Install **Expo Go** on your Android/iOS device
2. Scan the QR code shown in the terminal
3. App will load on your device

**For Android Emulator:**
```bash
cd mobile
npm run android
```

**For iOS Simulator (Mac only):**
```bash
cd mobile
npm run ios
```

### 2. If You Need to Restart

Stop the current server (Ctrl+C in the terminal) and run:
```bash
cd mobile
npm start
```

Or with cleared cache:
```bash
cd mobile
npx expo start -c
```

## Expo Development Server Commands

When the server is running, you can press:
- `a` - Open on Android device/emulator
- `i` - Open on iOS simulator (Mac only)
- `w` - Open in web browser
- `r` - Reload the app
- `m` - Toggle menu
- `j` - Open debugger
- `c` - Clear Metro bundler cache and reload
- `Ctrl+C` - Stop the server

## Testing Your App

### Test Login Flow:
1. Open the app in Expo Go
2. You should see the Welcome screen
3. Try registering a new account or logging in

### Test Admin Login:
Use the credentials from `COMO_LOGAR.md` to test admin access.

## Troubleshooting

### If the app won't load:
```bash
cd mobile
npx expo start -c
```

### If you see "Can't find variable: process":
Clear cache and restart:
```bash
cd mobile
rm -rf .expo
npx expo start -c
```

### If packages seem out of sync:
```bash
cd mobile
npx expo install --fix
npm start
```

### Complete reset (nuclear option):
```bash
cd mobile
./fix-turbomodule.sh
```

## What Was Fixed

### Root Cause
The TurboModuleRegistry error was caused by version mismatches between React Native, React, and Expo SDK packages.

### Solution Applied
1. Cleared all caches (npm, Metro, Expo)
2. Removed and reinstalled node_modules
3. **Updated all packages to match Expo SDK 54 requirements**
4. Restarted with cleared cache

### Package Updates
All packages were updated to their Expo SDK 54 compatible versions using:
```bash
npx expo install --fix
```

## Development Tips

### Installing New Packages
Always use Expo's install command to ensure version compatibility:
```bash
npx expo install package-name
```

### After Installing Native Packages
Always restart with cleared cache:
```bash
npx expo start -c
```

### Keep Dependencies Updated
Run periodically:
```bash
npx expo-doctor
npx expo install --fix
```

## Environment Setup

Make sure you have a `.env` file in the mobile folder with:
```
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Copy from `.env.example` if needed:
```bash
cd mobile
cp .env.example .env
# Then edit .env with your credentials
```

## Current Package Versions

✅ All packages are now properly aligned:
- **Expo SDK**: 54.0.0
- **React**: 19.1.0
- **React Native**: 0.81.5

## Status

🟢 **READY TO USE**

The development server is running and your app should work without TurboModuleRegistry errors.

## Need Help?

See the full troubleshooting guide in `TURBOMODULE_FIX.md`
