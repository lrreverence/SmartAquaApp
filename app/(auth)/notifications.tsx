import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";

interface Notification {
  id: number;
  type: 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
}

const NotificationsPage = () => {
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
          setNotifications(prev => [{
            id: Date.now(),
            type: 'warning',
            message: `⚠️ pH Level High! (${data.toFixed(1)}) - Action Needed!`,
            timestamp: new Date().toLocaleString()
          }, ...prev]);

          // Add water change notification after 5 seconds
          setTimeout(() => {
            setNotifications(prev => [{
              id: Date.now(),
              type: 'info',
              message: '💧 Water Change Required - pH Level Critical',
              timestamp: new Date().toLocaleString()
            }, ...prev]);
          }, 5000);

          // Add water change complete notification after 10 seconds
          setTimeout(() => {
            setNotifications(prev => [{
              id: Date.now(),
              type: 'success',
              message: '✅ Water Change Completed - pH Level Stabilized',
              timestamp: new Date().toLocaleString()
            }, ...prev]);
          }, 20000);
        }
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>🔔 Notifications & Alerts</Text>
        
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
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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