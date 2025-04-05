import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

interface ArduinoData {
  timestamp: number;
  temperature: number;
  ph: number;
  turbidity: number;
}

export default function ArduinoDataScreen() {
  const [data, setData] = useState<ArduinoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArduinoData = async () => {
    try {
      // Replace this URL with your actual backend API endpoint
      const response = await fetch('YOUR_BACKEND_API_URL/arduino-data');
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching Arduino data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArduinoData();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchArduinoData, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchArduinoData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BCD4" />
      </View>
    );
  }

  const chartData = {
    labels: data.slice(-6).map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        data: data.slice(-6).map(d => d.temperature),
        color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Aquarium Data</Text>
        <Text style={styles.subtitle}>Real-time monitoring</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Temperature</Text>
        <Text style={styles.value}>{data[data.length - 1]?.temperature.toFixed(1)}°C</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>pH Level</Text>
        <Text style={styles.value}>{data[data.length - 1]?.ph.toFixed(1)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Turbidity</Text>
        <Text style={styles.value}>{data[data.length - 1]?.turbidity.toFixed(1)} NTU</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006064',
  },
  subtitle: {
    fontSize: 16,
    color: '#00838F',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00838F',
    marginBottom: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00BCD4',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
}); 