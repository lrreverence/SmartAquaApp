import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";

const Parameters = () => {
	const router = useRouter();
	const [pH, setPH] = useState(0);
	const [minPh, setMinPh] = useState(6.5);
	const [maxPh, setMaxPh] = useState(8.5);

	useEffect(() => {
		// Set up real-time listener for pH data
		const db = getDatabase(app);
		const pHRef = ref(db, 'test/ph');
		const thresholdsRef = ref(db, 'thresholds');
		
		const unsubscribePh = onValue(pHRef, snapshot => {
			const data = snapshot.val();
			if (data !== null) {
				setPH(data);
			}
		});

		const unsubscribeThresholds = onValue(thresholdsRef, snapshot => {
			const data = snapshot.val();
			if (data) {
				setMinPh(data.minPh || 6.5);
				setMaxPh(data.maxPh || 8.5);
			}
		});

		// Cleanup listeners on component unmount
		return () => {
			unsubscribePh();
			unsubscribeThresholds();
		};
	}, []);

	const getPhStatus = () => {
		if (pH < minPh || pH > maxPh) {
			return 'Above Normal';
		}
		return 'Normal';
	};
	
	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<View style={styles.header}>
					<MaterialCommunityIcons name="chart-bar" size={24} color="#007AFF" />
					<Text style={styles.headerText}>Live Water Parameter Monitoring</Text>
				</View>

				<View style={styles.parameterRow}>
					<View style={styles.parameterItem}>
						<FontAwesome5 name="exclamation-triangle" size={18} color="#FFA500" />
						<Text style={styles.parameterLabel}>pH Level:</Text>
						<Text style={styles.parameterValue}>[{pH.toFixed(1)}]</Text>
						<Text style={styles.parameterStatus}>({getPhStatus()})</Text>
					</View>
				</View>

				<View style={styles.parameterRow}>
					<View style={styles.parameterItem}>
						<Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
						<Text style={styles.parameterLabel}>Water Level:</Text>
						<Text style={styles.parameterValue}>[80%]</Text>
						<Text style={styles.parameterStatus}>(Stable)</Text>
					</View>
				</View>

				<View style={styles.parameterRow}>
					<View style={styles.parameterItem}>
						<MaterialCommunityIcons name="clock-outline" size={20} color="#007AFF" />
						<Text style={[styles.parameterLabel, { color: '#007AFF' }]}>Estimated Next Water Change:</Text>
						<Text style={[styles.parameterValue, { color: '#007AFF' }]}>[12 Hours]</Text>
					</View>
				</View>

				<View style={styles.actionsSection}>
					<Text style={styles.actionsHeader}>Actions</Text>
					
					<TouchableOpacity 
						style={styles.actionButton}
						onPress={() => router.push('/(auth)/logs')}
					>
						<MaterialCommunityIcons name="chart-line" size={20} color="#007AFF" />
						<Text style={styles.actionButtonText}>View Parameter History</Text>
					</TouchableOpacity>

					<TouchableOpacity 
						style={styles.actionButton}
						onPress={() => router.push('/(auth)/notifications')}
					>
						<MaterialCommunityIcons name="bell-outline" size={20} color="#FFA500" />
						<Text style={styles.actionButtonText}>Set Alerts & Notifications</Text>
					</TouchableOpacity>

					<TouchableOpacity 
						style={[styles.actionButton, { marginBottom: 0 }]}
						onPress={() => {
							// Add refresh functionality here
							console.log('Refreshing data...');
						}}
					>
						<MaterialCommunityIcons name="refresh" size={20} color="#007AFF" />
						<Text style={[styles.actionButtonText, { color: '#007AFF' }]}>Refresh Data</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#F5F5F5',
	},
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#EEE',
	},
	headerText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#007AFF',
		marginLeft: 8,
	},
	parameterRow: {
		marginBottom: 16,
	},
	parameterItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
	},
	parameterLabel: {
		fontSize: 16,
		marginLeft: 8,
		color: '#333',
	},
	parameterValue: {
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
		color: '#333',
	},
	parameterStatus: {
		fontSize: 14,
		color: '#666',
		marginLeft: 8,
	},
	actionsSection: {
		marginTop: 16,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: '#EEE',
	},
	actionsHeader: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 12,
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		marginBottom: 12,
	},
	actionButtonText: {
		fontSize: 16,
		marginLeft: 8,
		color: '#333',
	},
});

export default Parameters; 