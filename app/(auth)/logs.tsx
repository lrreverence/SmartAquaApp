import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";

interface LogEntry {
  timestamp: string;
  message: string;
  icon: string;
}

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pH, setPH] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);

  // Load logs from AsyncStorage when component mounts
  useEffect(() => {
    loadLogs();
  }, []);

  // Set up real-time database listeners
  useEffect(() => {
    const db = getDatabase(app);
    const pHRef = ref(db, 'test/ph');
    const waterLevelRef = ref(db, 'test/water_level');
    
    const pHUnsubscribe = onValue(pHRef, snapshot => {
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
        
        const newLog: LogEntry = {
          timestamp,
          message: `pH Level: ${data.toFixed(1)}`,
          icon: '📊'
        };
        addLog(newLog);
      }
    });

    const waterLevelUnsubscribe = onValue(waterLevelRef, snapshot => {
      const data = snapshot.val();
      if (data !== null) {
        setWaterLevel(data);
        // Add new log entry when water level changes
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        const newLog: LogEntry = {
          timestamp,
          message: `Water Level: ${data.toFixed(1)}%`,
          icon: '💧'
        };
        addLog(newLog);
      }
    });

    // Cleanup listeners on component unmount
    return () => {
      pHUnsubscribe();
      waterLevelUnsubscribe();
    };
  }, []);

  const loadLogs = async () => {
    try {
      const storedLogs = await AsyncStorage.getItem('aquariumLogs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        setLogs(parsedLogs);
      } else {
        // Initialize with some sample logs if none exist
        const initialLogs: LogEntry[] = [
          { timestamp: '2025-03-19 08:30 AM', message: 'Water change 50%', icon: '💧' },
          { timestamp: '2025-03-19 06:00 AM', message: 'pH adjusted (7.1)', icon: '💧' },
          { timestamp: '2025-03-18 10:15 PM', message: 'Low water level', icon: '💧' },
        ];
        setLogs(initialLogs);
        await AsyncStorage.setItem('aquariumLogs', JSON.stringify(initialLogs));
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = async (newLog: LogEntry) => {
    try {
      // Get current logs from AsyncStorage
      const currentLogs = await AsyncStorage.getItem('aquariumLogs');
      let updatedLogs: LogEntry[] = [];
      
      if (currentLogs) {
        updatedLogs = JSON.parse(currentLogs);
      }
      
      // Add new log at the beginning and keep only last 100 logs
      updatedLogs = [newLog, ...updatedLogs].slice(0, 100);
      
      // Update both state and storage
      setLogs(updatedLogs);
      await AsyncStorage.setItem('aquariumLogs', JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  const clearLogs = async () => {
    try {
      setLogs([]);
      await AsyncStorage.removeItem('aquariumLogs');
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  const refreshLogs = () => {
    loadLogs();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 System Activity Logs</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading logs...</Text>
        </View>
      ) : (
        <ScrollView style={styles.logsContainer}>
          {logs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <Text style={styles.logIcon}>{log.icon}</Text>
              <Text style={styles.logText}>[ {log.timestamp} ] {log.message}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.footerButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerButton}
          onPress={clearLogs}
        >
          <Text style={styles.footerButtonText}>🗑️ Clear Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerButton}
          onPress={refreshLogs}
        >
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LogsPage; 