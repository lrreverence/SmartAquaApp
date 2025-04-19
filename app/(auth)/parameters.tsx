import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";
import { Link } from 'expo-router';

const Parameters = () => {
	const router = useRouter();
	const [pH, setPH] = useState(0);
	const [waterLevel, setWaterLevel] = useState(0);
	const [minPh, setMinPh] = useState(6.5);
	const [maxPh, setMaxPh] = useState(8.5);
	const [minWaterLevel, setMinWaterLevel] = useState(20);
	const [maxWaterLevel, setMaxWaterLevel] = useState(100);

	useEffect(() => {
		// Set up real-time listener for pH data
		const db = getDatabase(app);
		const pHRef = ref(db, 'test/ph');
		const waterLevelRef = ref(db, 'test/water_level');
		const thresholdsRef = ref(db, 'thresholds');
		
		const unsubscribePh = onValue(pHRef, snapshot => {
			const data = snapshot.val();
			if (data !== null) {
				setPH(data);
			}
		});

		const unsubscribeWaterLevel = onValue(waterLevelRef, snapshot => {
			const data = snapshot.val();
			if (data !== null) {
				setWaterLevel(data);
			}
		});

		const unsubscribeThresholds = onValue(thresholdsRef, snapshot => {
			const data = snapshot.val();
			if (data) {
				setMinPh(data.minPh || 6.5);
				setMaxPh(data.maxPh || 8.5);
				setMinWaterLevel(data.minWaterLevel || 20);
				setMaxWaterLevel(data.maxWaterLevel || 100);
			}
		});

		// Cleanup listeners on component unmount
		return () => {
			unsubscribePh();
			unsubscribeWaterLevel();
			unsubscribeThresholds();
		};
	}, []);

	const getPhStatus = () => {
		if (pH < minPh || pH > maxPh) {
			return 'Above Normal';
		}
		return 'Normal';
	};

	const getWaterLevelStatus = () => {
		if (waterLevel < minWaterLevel) {
			return 'Low';
		} else if (waterLevel > maxWaterLevel) {
			return 'High';
		}
		return 'Stable';
	};
	
	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<View style={styles.headerContainer}>
					<TouchableOpacity 
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<Ionicons name="arrow-back" size={24} color="#007AFF" />
					</TouchableOpacity>
					<Text style={styles.headerText}>Live Water Parameter Monitoring</Text>
				</View>

				<View style={styles.content}>
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
							<Text style={styles.parameterValue}>[{waterLevel.toFixed(1)}%]</Text>
							<Text style={styles.parameterStatus}>({getWaterLevelStatus()})</Text>
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
								console.log('Refreshing data...');
							}}
						>
							<MaterialCommunityIcons name="refresh" size={20} color="#007AFF" />
							<Text style={[styles.actionButtonText, { color: '#007AFF' }]}>Refresh Data</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Navigation Bar */}
			<View style={styles.navbar}>
				<Link href="/(auth)/home" asChild>
					<TouchableOpacity style={styles.navItem}>
						<Ionicons name="home" size={24} color="#4A90E2" />
						<Text style={styles.navText}>Dashboard</Text>
					</TouchableOpacity>
				</Link>
				<Link href="/(auth)/parameters" asChild>
					<TouchableOpacity style={styles.navItem}>
						<Ionicons name="analytics-outline" size={24} color="#4A90E2" />
						<Text style={styles.navText}>Parameters</Text>
					</TouchableOpacity>
				</Link>
				<Link href="/(auth)/settings" asChild>
					<TouchableOpacity style={styles.navItem}>
						<Ionicons name="settings-outline" size={24} color="#4A90E2" />
						<Text style={styles.navText}>Settings</Text>
					</TouchableOpacity>
				</Link>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5F5F5',
		padding: 16,
		paddingTop: 20,
		position: 'relative',
	},
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#EEE',
		padding: 16,
	},
	backButton: {
		padding: 8,
		marginLeft: -8,
	},
	headerText: {
		fontSize: 18,
		color: '#007AFF',
		flex: 1,
		textAlign: 'center',
		marginRight: 24,
	},
	content: {
		padding: 16,
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
	navbar: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingVertical: 12,
		backgroundColor: '#FFFFFF',
		borderTopWidth: 1,
		borderTopColor: '#E9ECEF',
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 1000,
	},
	navItem: {
		alignItems: 'center',
	},
	navText: {
		color: '#4A90E2',
		fontSize: 12,
		marginTop: 4,
	},
});

export default Parameters; 