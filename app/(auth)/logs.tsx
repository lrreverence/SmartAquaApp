import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

const LogsPage = () => {
  const logs = [
    { timestamp: '2025-03-19 08:30 AM', message: 'Water change 50%', icon: '💧' },
    { timestamp: '2025-03-19 06:00 AM', message: 'pH adjusted (7.1)', icon: '💧' },
    { timestamp: '2025-03-18 10:15 PM', message: 'Low water level', icon: '💧' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 System Activity Logs</Text>
      </View>

      <ScrollView style={styles.logsContainer}>
        {logs.map((log, index) => (
          <View key={index} style={styles.logItem}>
            <Text style={styles.logIcon}>{log.icon}</Text>
            <Text style={styles.logText}>[ {log.timestamp} ] {log.message}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.footerButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerButtonText}>🔍 Filter Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerButtonText}>↻ Refresh</Text>
        </TouchableOpacity>
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
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  logIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  logText: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerButton: {
    padding: 8,
  },
  footerButtonText: {
    color: '#4A90E2',
    fontSize: 14,
  },
});

export default LogsPage; 