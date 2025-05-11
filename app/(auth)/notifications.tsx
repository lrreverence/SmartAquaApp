import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";
import { useRouter } from 'expo-router';

interface Notification {
  id: number;
  type: 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
}

const NotificationsPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pH, setPH] = useState(0);

  useEffect(() => {
    // Set up real-time listener for pH data
    const db = getDatabase(app);
    const pHRef = ref(db, 'test/ph');
    
    const unsubscribe = onValue(pHRef, snapshot => {
      const data = snapshot.val();
      if (data !== null) {
        setPH(data);
        // Check if pH is above threshold
        if (data >= 8.5) {
          // Add pH high notification
          const notification = {
            id: Date.now(),
            type: 'warning' as const,
            message: `⚠️ pH Level High! (${data.toFixed(1)}) - Action Needed!`,
            timestamp: new Date().toLocaleString()
          };
          setNotifications(prev => [notification, ...prev]);

          // Add water change notification after 5 seconds
          setTimeout(() => {
            const waterChangeNotification = {
              id: Date.now(),
              type: 'info' as const,
              message: `💧 Water Change Required - pH Level ${data >= 8.5 ? 'Alkaline' : 'Acidic'}`,
              timestamp: new Date().toLocaleString()
            };
            setNotifications(prev => [waterChangeNotification, ...prev]);
          }, 5000);

          // Add water change complete notification after 10 seconds
          setTimeout(() => {
            const completeNotification = {
              id: Date.now(),
              type: 'success' as const,
              message: '✅ Water Change Completed - pH Level Stabilized',
              timestamp: new Date().toLocaleString()
            };
            setNotifications(prev => [completeNotification, ...prev]);
          }, 20000);
        }
      }
    });

    // Cleanup listeners on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.header}>🔔 Notifications & Alerts</Text>
        </View>
        
        <View style={styles.alertList}>
          {notifications.map((notification) => (
            <View key={notification.id} style={styles.alertItem}>
              <Text style={styles.alertText}>
                {notification.message}
              </Text>
              <Text style={styles.timestamp}>{notification.timestamp}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>📋 View All Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={clearAllNotifications}>
            <Text style={styles.buttonText}>❌ Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginRight: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  alertList: {
    marginVertical: 16,
  },
  alertItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  alertText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 14,
    color: '#666',
  },
});

export default NotificationsPage; 