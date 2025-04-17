import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";

const LogsPage = () => {
  const [logs, setLogs] = useState([
    { timestamp: '2025-03-19 08:30 AM', message: 'Water change 50%', icon: '💧' },
    { timestamp: '2025-03-19 06:00 AM', message: 'pH adjusted (7.1)', icon: '💧' },
    { timestamp: '2025-03-18 10:15 PM', message: 'Low water level', icon: '💧' },
  ]);
  const [pH, setPH] = useState(0);

  useEffect(() => {
    // Set up real-time listener for pH data
    const db = getDatabase(app);
    const pHRef = ref(db, 'test/ph');
    
    const unsubscribe = onValue(pHRef, snapshot => {
      const data = snapshot.val();
      if (data !== null) {
        setPH(data);
        // Add new log entry when pH changes
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        setLogs(prevLogs => [{
          timestamp,
          message: `pH Level: ${data.toFixed(1)}`,
          icon: '📊'
        }, ...prevLogs.slice(0, 9)]); // Keep last 10 logs
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

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

        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => setLogs([])}
        >
          <Text style={styles.footerButtonText}>🗑️ Clear Logs</Text>
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