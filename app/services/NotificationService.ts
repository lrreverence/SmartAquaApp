import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getDatabase, ref, set, remove } from 'firebase/database';
import { app } from '../firebase';
import auth from '@react-native-firebase/auth';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Request notification permissions
  public async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Register for push notifications and get FCM token
  public async registerForPushNotifications(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get the token that uniquely identifies this device
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'fff0fc00-a426-4923-b7a1-7db0ba190f0b', // Replace with your Expo project ID
      });

      this.expoPushToken = token.data;
      console.log('Expo push token:', this.expoPushToken);

      // Register token with Firebase Database
      await this.registerTokenWithFirebase(this.expoPushToken);

      // Set up notification listeners
      this.setupNotificationListeners();

      return this.expoPushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Register FCM token with Firebase Database
  private async registerTokenWithFirebase(token: string): Promise<void> {
    try {
      // Check if user is authenticated
      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.log('User not authenticated, skipping token registration');
        return;
      }

      const userId = currentUser.uid;
      const database = getDatabase(app);
      
      // Store the token in the database under the user's ID
      await set(ref(database, `user_tokens/${userId}`), {
        token: token,
        timestamp: Date.now(),
        platform: Platform.OS
      });
      
      console.log('FCM token registered with Firebase Database');
    } catch (error) {
      console.error('Error registering token with Firebase:', error);
    }
  }

  // Unregister FCM token from Firebase Database
  public async unregisterTokenFromFirebase(): Promise<void> {
    try {
      // Check if user is authenticated
      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.log('User not authenticated, skipping token unregistration');
        return;
      }

      const userId = currentUser.uid;
      const database = getDatabase(app);
      
      // Remove the token from the database
      await remove(ref(database, `user_tokens/${userId}`));
      console.log('FCM token unregistered from Firebase Database');
    } catch (error) {
      console.error('Error unregistering token from Firebase:', error);
    }
  }

  // Set up notification listeners
  private setupNotificationListeners(): void {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received in app:', notification);
      console.log('📱 Platform:', Platform.OS);
      console.log('📱 Device:', Device.isDevice ? 'Physical Device' : 'Simulator');
    });

    // Listen for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      
      // Handle notification tap - you can navigate to specific screens here
      const data = response.notification.request.content.data;
      if (data?.type === 'ph_alert') {
        // Navigate to parameters or home screen
        console.log('pH alert notification tapped');
      }
    });
  }

  // Create notification channel for Android
  public async createNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      // pH alerts channel
      await Notifications.setNotificationChannelAsync('ph_alerts', {
        name: 'pH Level Alerts',
        description: 'Notifications for abnormal pH levels',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // Water level alerts channel
      await Notifications.setNotificationChannelAsync('water_level_alerts', {
        name: 'Water Level Alerts',
        description: 'Notifications for water level changes',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  }

  // Send local test notification
  public async sendTestNotification(): Promise<void> {
    try {
      console.log('Sending test notification...');
      
      // Check if we have permission first
      const { status } = await Notifications.getPermissionsAsync();
      console.log('Notification permission status:', status);
      
      if (status !== 'granted') {
        console.log('Requesting notification permissions...');
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        console.log('New permission status:', newStatus);
        
        if (newStatus !== 'granted') {
          throw new Error('Notification permission not granted');
        }
      }

      // Create notification channel for Android
      if (Platform.OS === 'android') {
        await this.createNotificationChannel();
      }

      // Send an immediate notification with proper configuration
      console.log('Sending immediate notification...');
      const immediateId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 SmartAqua Test',
          body: 'This is a test notification from SmartAqua app',
          data: { type: 'test_immediate' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // null trigger means immediate
      });
      console.log('Immediate notification scheduled with ID:', immediateId);

      // Also schedule a delayed notification for testing
      console.log('Scheduling delayed notification...');
      const delayedId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Delayed Test',
          body: 'This is a delayed test notification (3 seconds)',
          data: { type: 'test_delayed' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3 
        },
      });
      
      console.log('Delayed notification scheduled with ID:', delayedId);
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error; // Re-throw so the calling code can handle it
    }
  }

  // Clean up listeners
  public cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get current token
  public getToken(): string | null {
    return this.expoPushToken;
  }
}

export default NotificationService; 