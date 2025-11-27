#!/bin/bash

# Script to fix TurboModuleRegistry errors in React Native/Expo

echo "🔧 Fixing TurboModuleRegistry error..."
echo ""

# Stop any running Metro bundler processes
echo "1. Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true
sleep 2

# Clear watchman if available
if command -v watchman &> /dev/null; then
    echo "2. Clearing Watchman..."
    watchman watch-del-all
else
    echo "2. Watchman not installed, skipping..."
fi

# Clear Metro bundler cache
echo "3. Clearing Metro bundler cache..."
rm -rf $TMPDIR/react-* || true
rm -rf $TMPDIR/metro-* || true

# Clear Expo cache
echo "4. Clearing Expo cache..."
rm -rf ~/.expo/cache || true
rm -rf .expo || true

# Clear npm cache
echo "5. Clearing npm cache..."
npm cache clean --force

# Remove node_modules and reinstall
echo "6. Removing node_modules..."
rm -rf node_modules
rm -rf package-lock.json

echo "7. Reinstalling dependencies..."
npm install

echo ""
echo "✅ Fix complete! Now start your app with:"
echo "   npm start"
echo ""
echo "Or to start with cleared cache:"
echo "   npx expo start -c"
echo ""
