import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ManualControlPage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Ionicons name="hand-right" size={24} color="#FF6B6B" />
          <Text style={styles.title}>Manual Control & Overrides</Text>
        </View>

        {/* Water Level Indicator */}
        <View style={styles.controlSection}>
          <View style={styles.waterLevelContainer}>
            <View style={styles.waterLevelHeader}>
              <Ionicons name="beaker" size={20} color="#4A90E2" />
              <Text style={styles.controlLabel}>Water Level</Text>
              <Text style={styles.waterLevelValue}>75%</Text>
            </View>
            <View style={styles.waterLevelBar}>
              <View style={[styles.waterLevelFill, { width: '75%' }]} />
            </View>
          </View>
        </View>

        {/* Water Pump Control */}
        <View style={styles.controlSection}>
          <View style={styles.controlRow}>
            <Ionicons name="water" size={20} color="#4A90E2" />
            <Text style={styles.controlLabel}>Water Pump Control</Text>
          </View>
        </View>

        {/* Water Controls */}
        <View style={styles.controlSection}>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="water-outline" size={20} color="#4A90E2" />
              <Text style={styles.buttonText}>Drain Water</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="water" size={20} color="#4A90E2" />
              <Text style={styles.buttonText}>Refill Water</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Solenoid Valve Controls */}
        <View style={styles.controlSection}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Solenoid Valve:</Text>
            <TouchableOpacity style={styles.valveButton}>
              <Text style={styles.buttonText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.valveButton}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Stop */}
        <View style={styles.emergencySection}>
          <TouchableOpacity style={styles.emergencyButton}>
            <Ionicons name="warning" size={20} color="#fff" />
            <Text style={styles.emergencyText}>Emergency Stop: Stop All</Text>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  controlSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 8,
    flex: 1,
  },
  valveButton: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  emergencySection: {
    paddingTop: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  waterLevelContainer: {
    gap: 8,
  },
  waterLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waterLevelValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  waterLevelBar: {
    height: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  waterLevelFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    opacity: 0.7,
  },
});

export default ManualControlPage; 