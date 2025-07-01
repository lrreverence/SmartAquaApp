# Push Notifications Setup Guide for SmartAqua App

## Overview
This guide explains how to set up push notifications for abnormal pH levels in your SmartAqua app. The implementation uses Firebase Cloud Messaging (FCM) with Firebase Functions for server-side monitoring.

## Features Implemented
- ✅ Real-time pH level monitoring
- ✅ Push notifications when pH goes outside configured range
- ✅ Android notification channel setup
- ✅ FCM token registration/unregistration
- ✅ Test notification functionality
- ✅ Firebase Functions for server-side processing

## Prerequisites
1. Firebase project with Realtime Database enabled
2. Firebase Functions enabled
3. Android device for testing (push notifications don't work in simulators)
4. Expo project with EAS Build (for production)

## Setup Steps

### 1. Firebase Configuration

#### Update Firebase Functions
```bash
cd functions
npm install
```

#### Deploy Firebase Functions
```bash
firebase deploy --only functions
```

### 2. Expo Configuration

#### Update app.json
Add the following to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

#### Get Expo Project ID
1. Run `expo whoami` to check if you're logged in
2. Run `expo projects` to see your project ID
3. Update the `projectId` in `app/services/NotificationService.ts`

### 3. Android Configuration

#### Add Google Services
1. Download `google-services.json` from Firebase Console
2. Place it in the `android/app/` directory
3. Ensure it's referenced in `android/build.gradle`

#### Update Android Manifest
Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### 4. Build and Test

#### Development Build
```bash
npx expo run:android
```

#### Production Build
```bash
eas build --platform android
```

## How It Works

### 1. pH Monitoring
- Firebase Function `monitorPhLevels` watches the `/test/ph` path in Realtime Database
- When pH value changes, it checks against configured thresholds
- If pH goes outside range, push notifications are sent immediately

### 2. Notification Flow
1. pH sensor sends data to Firebase Database
2. Firebase Function detects abnormal pH
3. Function retrieves all user FCM tokens
4. Push notification sent to all registered devices
5. App receives notification and displays alert

### 3. User Registration
- App requests notification permissions on startup
- FCM token is generated and registered with Firebase Functions
- Token stored in `/user_tokens/{userId}` in database

## Testing

### 1. Test Local Notifications
1. Open the app
2. Go to Settings
3. Tap "Test Push Notification"
4. Verify notification appears

### 2. Test pH Alerts
1. Set pH thresholds in Settings (e.g., 6.5-8.5)
2. Manually update pH value in Firebase Database to be outside range
3. Verify push notification is received

### 3. Firebase Console Testing
1. Go to Firebase Console > Messaging
2. Send test message to specific device
3. Verify notification delivery

## Troubleshooting

### Common Issues

#### 1. Notifications Not Working
- Check if device is physical (not simulator)
- Verify notification permissions are granted
- Check Firebase Functions logs for errors
- Ensure FCM token is properly registered

#### 2. Firebase Functions Errors
```bash
firebase functions:log
```

#### 3. Token Registration Issues
- Check Firebase Functions deployment
- Verify user authentication
- Check database rules for `/user_tokens` path

### Debug Steps
1. Check console logs for FCM token generation
2. Verify token is stored in Firebase Database
3. Test Firebase Functions manually
4. Check notification permissions in device settings

## Database Structure

### Required Paths
```
/thresholds
  - minPh: number
  - maxPh: number
  - emailAddress: string

/user_tokens
  - {userId}: string (FCM token)

/test/ph: number (current pH value)
```

### Security Rules
```json
{
  "rules": {
    "user_tokens": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "thresholds": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## Customization

### Notification Content
Edit the notification message in `functions/src/index.ts`:

```typescript
notification: {
  title: '⚠️ pH Level Alert',
  body: `pH level is abnormal (${phValue.toFixed(1)}). Normal range: ${minPh}-${maxPh}. Changing water.`,
}
```

### Notification Channel
Customize Android notification channel in `NotificationService.ts`:

```typescript
await Notifications.setNotificationChannelAsync('ph_alerts', {
  name: 'pH Level Alerts',
  description: 'Notifications for abnormal pH levels',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C',
  sound: 'default',
  enableVibrate: true,
  showBadge: true,
});
```

## Production Deployment

### 1. Build Production App
```bash
eas build --platform android --profile production
```

### 2. Deploy Functions
```bash
firebase deploy --only functions
```

### 3. Test Production
- Install production build on device
- Test with real pH sensor data
- Monitor Firebase Functions logs

## Support

For issues or questions:
- Check Firebase Functions logs
- Review Expo documentation for notifications
- Contact development team

## Files Modified/Created

### New Files
- `functions/package.json` - Firebase Functions dependencies
- `functions/src/index.ts` - pH monitoring and notification functions
- `app/services/NotificationService.ts` - Client-side notification service
- `PUSH_NOTIFICATIONS_SETUP.md` - This setup guide

### Modified Files
- `app/_layout.tsx` - Added notification service initialization
- `app/(auth)/settings.tsx` - Added test notification button

## Next Steps
1. Deploy Firebase Functions
2. Update Expo project ID
3. Build and test on Android device
4. Configure production environment
5. Monitor and optimize notification delivery 