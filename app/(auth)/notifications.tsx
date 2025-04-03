import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsPage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>🔔 Notifications & Alerts</Text>
        
        <View style={styles.alertList}>
          <View style={styles.alertItem}>
            <Text style={styles.alertText}>
              ⚠️ pH <Text style={styles.highlight}>Level</Text> High! (7.6) - Action Needed!
            </Text>
          </View>

          <View style={styles.alertItem}>
            <Text style={styles.alertText}>
              ✓ Water Change Completed (50% refreshed)
            </Text>
          </View>

          <View style={styles.alertItem}>
            <Text style={styles.alertText}>
              ✓ <Text style={styles.highlight}>System</Text> Rebooted - <Text style={styles.highlight}>All</Text> Sensors Active
            </Text>
          </View>

          <View style={styles.alertItem}>
            <Text style={styles.alertText}>
              ⚠️ <Text style={styles.highlight}>New</Text> Update Available - Click <Text style={styles.highlight}>to</Text> Apply
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>📋 View All Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
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
  highlight: {
    color: '#333',
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