#!/bin/bash

echo "🚀 SmartAqua Push Notifications Setup"
echo "====================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged into Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

echo "✅ Firebase CLI is ready"

# Install Firebase Functions dependencies
echo "📦 Installing Firebase Functions dependencies..."
cd functions
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build Firebase Functions
echo "🔨 Building Firebase Functions..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Functions built successfully"
else
    echo "❌ Failed to build functions"
    exit 1
fi

cd ..

# Deploy Firebase Functions
echo "🚀 Deploying Firebase Functions..."
firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo "✅ Functions deployed successfully"
else
    echo "❌ Failed to deploy functions"
    exit 1
fi

echo ""
echo "🎉 Push Notifications Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update your Expo project ID in app/services/NotificationService.ts"
echo "2. Build and test on an Android device:"
echo "   npx expo run:android"
echo "3. Test notifications in the Settings screen"
echo ""
echo "For detailed instructions, see PUSH_NOTIFICATIONS_SETUP.md" 