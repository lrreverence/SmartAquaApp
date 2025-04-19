import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class PushNotificationService {
  private static instance: PushNotificationService;
  private messaging: typeof messaging;

  private constructor() {
    this.messaging = messaging();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  public async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await this.messaging.requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public async getToken(): Promise<string | null> {
    try {
      const token = await this.messaging.getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  public async setupForegroundHandler(): Promise<void> {
    this.messaging.onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      // Handle foreground messages here
    });
  }

  public async setupBackgroundHandler(): Promise<void> {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received:', remoteMessage);
      // Handle background messages here
    });
  }

  public async setupNotificationOpenedHandler(): Promise<void> {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened from background state:', remoteMessage);
      // Handle notification opened from background state
    });

    // Check if app was opened from a notification
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log('Notification opened from quit state:', initialNotification);
      // Handle notification opened from quit state
    }
  }
}

export default PushNotificationService; 