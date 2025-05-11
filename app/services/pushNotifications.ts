import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  private static instance: PushNotificationService;
  private db: ReturnType<typeof getDatabase>;

  private constructor() {
    this.db = getDatabase(app);
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private handleRegistrationError(errorMessage: string) {
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  public async requestUserPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      // For Android 9 and below, we don't need to request POST_NOTIFICATIONS permission
      // Just set up the notification channel
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        enableVibrate: true,
        enableLights: true,
        sound: 'default',
        showBadge: true,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        this.handleRegistrationError('Permission not granted to get push token for push notification!');
        return false;
      }
      return true;
    } else {
      this.handleRegistrationError('Must use physical device for push notifications');
      return false;
    }
  }

  public async getExpoPushToken(): Promise<string | null> {
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        this.handleRegistrationError('Project ID not found');
        return null;
      }

      const pushTokenString = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
      console.log('Expo Push Token:', pushTokenString); // Debug log
      return pushTokenString;
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      return null;
    }
  }

  public async sendPushNotification(expoPushToken: string, title: string, body: string, data: any = {}) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high', // Add high priority for Android 9
      android: {
        priority: 'high',
        channelId: 'default',
        sound: 'default',
        vibrate: [0, 250, 250, 250],
      },
    };

    try {
      console.log('Sending push notification:', message); // Debug log
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      const responseData = await response.json();
      console.log('Push notification response:', responseData); // Debug log
      
      if (!response.ok) {
        throw new Error(`Failed to send push notification: ${JSON.stringify(responseData)}`);
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  public async checkAndSendAlerts(
    currentPh: number,
    minPh: number,
    maxPh: number,
    userId: string
  ): Promise<void> {
    try {
      console.log('Checking pH levels:', { currentPh, minPh, maxPh }); // Debug log
      
      // Get user's push notification preferences and token
      const thresholdsRef = ref(this.db, 'thresholds');
      const snapshot = await onValue(thresholdsRef, async (snapshot) => {
        const data = snapshot.val();
        console.log('User preferences:', data); // Debug log
        
        if (data && data.pushAlerts && data.expoPushToken) {
          if (currentPh < minPh || currentPh > maxPh) {
            console.log('pH level out of range, sending notification'); // Debug log
            await this.sendPushNotification(
              data.expoPushToken,
              '⚠️ pH Level Alert',
              `Your aquarium's pH level (${currentPh.toFixed(1)}) is outside the safe range (${minPh}-${maxPh}). Please take action to stabilize the water parameters.`,
              {
                type: 'ph_alert',
                currentPh: currentPh.toString(),
                minPh: minPh.toString(),
                maxPh: maxPh.toString()
              }
            );
          }
        } else {
          console.log('Push notifications not enabled or token missing'); // Debug log
        }
      });
    } catch (error) {
      console.error('Error checking and sending push alerts:', error);
      throw error;
    }
  }

  public setupNotificationListeners(): void {
    // Handle notification when app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Received foreground notification:', notification);
    });

    // Handle notification when app is in background and user taps on it
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });
  }
}

export default PushNotificationService; 