import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { Video } from 'expo-av';
import { useRef, useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set, onDisconnect } from "firebase/database";
import { app } from "../firebase";
import NotificationService from '../services/NotificationService';
import * as Notifications from 'expo-notifications';


const Page = () => {
	const videoRef = useRef(null);
	const [pH, setPH] = useState(0);
	const [waterLevel, setWaterLevel] = useState(0);
	const [minPh, setMinPh] = useState(6.5);
	const [maxPh, setMaxPh] = useState(8.5);
	const [lastWaterChange, setLastWaterChange] = useState<Date | null>(null);
	const [isPhSensorConnected, setIsPhSensorConnected] = useState(false);
	const [isWaterSensorConnected, setIsWaterSensorConnected] = useState(false);
	const [lastPhUpdate, setLastPhUpdate] = useState<Date | null>(null);
	const [lastWaterUpdate, setLastWaterUpdate] = useState<Date | null>(null);
	const [previousPhValues, setPreviousPhValues] = useState<number[]>([]);
	const [previousWaterValues, setPreviousWaterValues] = useState<number[]>([]);
	const pathname = usePathname();
	const isHomeSelected = pathname === '/(auth)/home';

	useEffect(() => {
		// Set up real-time listener for pH data
		const db = getDatabase(app);
		const pHRef = ref(db, 'test/ph');
		const waterLevelRef = ref(db, 'test/water_level');
		const thresholdsRef = ref(db, 'thresholds');
		const lastWaterChangeRef = ref(db, 'last_water_change');
		const statusRef = ref(db, 'test/status');
		
		// Set initial states to offline
		setIsPhSensorConnected(false);
		setIsWaterSensorConnected(false);
		
		const unsubscribePh = onValue(pHRef, snapshot => {
			const data = snapshot.val();
			if (data !== null) {
				setPH(data);
				setLastPhUpdate(new Date());
				
				// Check pH level and send notification if needed
				checkPhLevelAndNotify(data, minPh, maxPh);
				
				// Update previous values array
				setPreviousPhValues(prev => {
					const newValues = [...prev, data];
					// Keep only last 10 values
					if (newValues.length > 10) {
						newValues.shift();
					}

					// If this is the first time we reach 10 values, set test/status to 0
					if (prev.length < 10 && newValues.length === 10) {
						console.log('First 10 pH values read. Setting test/status to 0.');
						const db = getDatabase(app);
						const statusRef = ref(db, 'test/status');
						set(statusRef, 0)
							.then(() => console.log('test/status set to 0'))
							.catch((err) => console.error('Failed to set test/status:', err));
					}

					return newValues;
				});
				// Check if pH is out of range and update last water change
				if (data < minPh || data > maxPh) {
					const currentTime = new Date();
					setLastWaterChange(currentTime);
					set(lastWaterChangeRef, currentTime.toISOString());
				}
			} else {
				// REMOVED: variation-based connection status logic
			}
		}, (error) => {
			console.error('Error reading pH data:', error);
			// REMOVED: variation-based connection status logic
		});

		const unsubscribeWaterLevel = onValue(waterLevelRef, snapshot => {
			const data = snapshot.val();
			if (data !== null) {
				setWaterLevel(data);
				setLastWaterUpdate(new Date());
				
				// Check water level and send notification if needed
				checkWaterLevelAndNotify(data);
				
				// Update previous values array
				setPreviousWaterValues(prev => {
					const newValues = [...prev, data];
					// Keep only last 5 values
					if (newValues.length > 5) {
						newValues.shift();
					}
					return newValues;
				});
				// REMOVED: variation-based connection status logic
			} else {
				// REMOVED: variation-based connection status logic
			}
		}, (error) => {
			console.error('Error reading water level data:', error);
			// REMOVED: variation-based connection status logic
		});

		const unsubscribeStatus = onValue(statusRef, snapshot => {
			const data = snapshot.val();
			const isConnected = data === 1;
			setIsPhSensorConnected(isConnected);
			setIsWaterSensorConnected(isConnected);
		}, (error) => {
			console.error('Error reading status data:', error);
			setIsPhSensorConnected(false);
			setIsWaterSensorConnected(false);
		});

		const unsubscribeThresholds = onValue(thresholdsRef, snapshot => {
			const data = snapshot.val();
			if (data) {
				setMinPh(Number(data.minPh) || 6.5);
				setMaxPh(Number(data.maxPh) || 8.5);
			}
		});

		const unsubscribeLastWaterChange = onValue(lastWaterChangeRef, snapshot => {
			const data = snapshot.val();
			if (data) {
				setLastWaterChange(new Date(data));
			}
		});

		// Cleanup listeners on component unmount
		return () => {
			unsubscribePh();
			unsubscribeWaterLevel();
			unsubscribeThresholds();
			unsubscribeLastWaterChange();
			unsubscribeStatus();
		};
	}, []);

	const getPhStatus = () => {
		if (pH < minPh) {
			return 'Acidic';
		} else if (pH > maxPh) {
			return 'Alkaline';
		}
		return 'Normal';
	};

	const getWaterLevelStatus = () => {
		if (waterLevel < 20) {
			return 'Critical';
		} else if (waterLevel < 70) {
			return 'Low';
		}
		return 'Stable';
	};

	const getTimeSinceLastWaterChange = () => {
		if (!lastWaterChange) return 'Never';
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - lastWaterChange.getTime()) / (1000 * 60));
		
		if (diffInMinutes < 60) {
			return `${diffInMinutes} Minutes Ago`;
		}
		
		const diffInHours = Math.floor(diffInMinutes / 60);
		return `${diffInHours} Hours Ago`;
	};

	const handleRefreshData = () => {
		const db = getDatabase(app);
		const statusRef = ref(db, 'test/status');
		set(statusRef, 0)
			.then(() => console.log('test/status set to 0 by refresh'))
			.catch((err) => console.error('Failed to set test/status on refresh:', err));
	};

	// Client-side pH monitoring without cooldown
	const checkPhLevelAndNotify = async (phValue: number, minPhValue: number, maxPhValue: number) => {
		// Check if pH is outside the normal range
		const isAbnormal = phValue < minPhValue || phValue > maxPhValue;
		
		if (isAbnormal) {
			console.log(`🔔 Client-side: pH level ${phValue} is outside normal range (${minPhValue}-${maxPhValue})`);
			
			try {
				let title = "⚠️ pH Level Alert";
				let body = "";
				
				if (phValue < minPhValue) {
					title = "🔵 pH Level Too Low";
					body = `pH level is too low (${phValue.toFixed(1)}). Normal range: ${minPhValue}-${maxPhValue}. Changing water.`;
				} else if (phValue > maxPhValue) {
					title = "🔴 pH Level Too High";
					body = `pH level is too high (${phValue.toFixed(1)}). Normal range: ${minPhValue}-${maxPhValue}. Changing water.`;
				} else {
					title = "⚠️ pH Level Alert";
					body = `pH level is abnormal (${phValue.toFixed(1)}). Normal range: ${minPhValue}-${maxPhValue}. Changing water.`;
				}
				
				// Send local notification with sound
				await Notifications.scheduleNotificationAsync({
					content: {
						title,
						body,
						data: {
							phValue: phValue.toString(),
							minPh: minPhValue.toString(),
							maxPh: maxPhValue.toString(),
							timestamp: Date.now().toString(),
							type: "ph_alert",
							alertType: phValue < minPhValue ? "low" : phValue > maxPhValue ? "high" : "abnormal"
						},
						sound: 'default',
						priority: Notifications.AndroidNotificationPriority.HIGH,
					},
					trigger: null, // Immediate notification
				});
				
				console.log(`✅ Client-side notification sent: ${title}`);
			} catch (error) {
				console.error('❌ Error sending client-side notification:', error);
			}
		}
	};

	// Client-side water level monitoring
	const checkWaterLevelAndNotify = async (waterLevelValue: number) => {
		// Determine water level status
		let waterStatus = "Stable";
		let isUnstable = false;
		
		if (waterLevelValue < 20) {
			waterStatus = "Critical";
			isUnstable = true;
		} else if (waterLevelValue < 70) {
			waterStatus = "Low";
			isUnstable = true;
		}
		
		if (isUnstable) {
			console.log(`💧 Client-side: Water level ${waterLevelValue}% is ${waterStatus}`);
			
			try {
				let title = "💧 Water Level Alert";
				let body = "";
				
				if (waterStatus === "Critical") {
					title = "🚨 Critical Water Level";
					body = `Water level is critically low (${waterLevelValue}%). Immediate action required!`;
				} else if (waterStatus === "Low") {
					title = "⚠️ Low Water Level";
					body = `Water level is low (${waterLevelValue}%). Consider adding water soon.`;
				} else {
					title = "💧 Water Level Update";
					body = `Water level is ${waterStatus.toLowerCase()} (${waterLevelValue}%).`;
				}
				
				// Send local notification with sound
				await Notifications.scheduleNotificationAsync({
					content: {
						title,
						body,
						data: {
							waterLevel: waterLevelValue.toString(),
							status: waterStatus,
							timestamp: Date.now().toString(),
							type: "water_level_alert"
						},
						sound: 'default',
						priority: Notifications.AndroidNotificationPriority.HIGH,
					},
					trigger: null, // Immediate notification
				});
				
				console.log(`✅ Client-side water level notification sent: ${title}`);
			} catch (error) {
				console.error('❌ Error sending client-side water level notification:', error);
			}
		}
	};

	return (
		<View style={styles.container}>
			{/* Video Section */}
			<View style={styles.videoContainer}>
				<Video
					ref={videoRef}
					style={styles.video}
					source={require('@/assets/aqarium-bg.mp4')}
					shouldPlay
					isLooping
					isMuted
				/>
			</View>

			{/* Content Section */}
			<View style={styles.contentContainer}>
				{/* Aquarium Status Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Aquarium Status</Text>
					<View style={styles.statusContainer}>
						<View style={styles.statusItem}>
							<Ionicons name="water-outline" size={24} color="#4A90E2" />
							<View style={styles.statusTextContainer}>
								<Text style={styles.statusLabel}>pH Level:</Text>
								<Text style={styles.statusValue}>{pH.toFixed(2)}</Text>
								<Text style={[styles.statusNote, (getPhStatus() === 'Acidic' || getPhStatus() === 'Alkaline') ? styles.criticalText : null]}>
									({getPhStatus()})
								</Text>
								<View style={[styles.sensorStatus, !isPhSensorConnected && styles.sensorOffline]}>
									<Ionicons 
										name={isPhSensorConnected ? "cloud-done" : "cloud-offline"} 
										size={16} 
										color={isPhSensorConnected ? "#4CAF50" : "#FF6B6B"} 
									/>
									<Text style={[styles.sensorStatusText, !isPhSensorConnected && styles.sensorOfflineText]}>
										{isPhSensorConnected ? "Connected" : "Disconnected"}
									</Text>
								</View>
							</View>
						</View>
						<View style={styles.statusItem}>
							<Ionicons name="git-compare-outline" size={24} color="#4A90E2" />
							<View style={styles.statusTextContainer}>
								<Text style={styles.statusLabel}>Normal Range:</Text>
								<Text style={styles.statusValue}>{minPh.toFixed(1)} - {maxPh.toFixed(1)}</Text>
							</View>
						</View>
						<View style={styles.statusItem}>
							<Ionicons name="thermometer-outline" size={24} color="#4A90E2" />
							<View style={styles.statusTextContainer}>
								<Text style={styles.statusLabel}>Water Level:</Text>
								<Text style={styles.statusValue}>{waterLevel}%</Text>
								<Text style={[styles.statusNote, getWaterLevelStatus() === 'Critical' ? styles.criticalText : null]}>
									({getWaterLevelStatus()})
								</Text>
								<View style={[styles.sensorStatus, !isWaterSensorConnected && styles.sensorOffline]}>
									<Ionicons 
										name={isWaterSensorConnected ? "cloud-done" : "cloud-offline"} 
										size={16} 
										color={isWaterSensorConnected ? "#4CAF50" : "#FF6B6B"} 
									/>
									<Text style={[styles.sensorStatusText, !isWaterSensorConnected && styles.sensorOfflineText]}>
										{isWaterSensorConnected ? "Connected" : "Disconnected"}
									</Text>
								</View>
							</View>
						</View>
						<View style={styles.lastUpdate}>
							<Ionicons name="time-outline" size={16} color="#666" />
							<Text style={styles.lastUpdateText}>Last Water Change: {getTimeSinceLastWaterChange()}</Text>
						</View>
					</View>
				</View>

				{/* Quick Actions Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Quick Actions</Text>
					<View style={styles.actionContainer}>
						<Link href="/(auth)/notifications" asChild>
							<TouchableOpacity style={styles.actionButton}>
								<Ionicons name="notifications-outline" size={24} color="#4A90E2" />
								<Text style={styles.actionText}>Notifications</Text>
							</TouchableOpacity>
						</Link>
						<Link href="/(auth)/logs" asChild>
							<TouchableOpacity style={styles.actionButton}>
								<Ionicons name="document-text-outline" size={24} color="#4A90E2" />
								<Text style={styles.actionText}>View Logs</Text>
							</TouchableOpacity>
						</Link>
						<TouchableOpacity style={styles.actionButton} onPress={handleRefreshData}>
							<Ionicons name="refresh-outline" size={24} color="#4A90E2" />
							<Text style={styles.actionText}>Refresh Data</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Navigation Bar */}
			<View style={styles.navbar}>
				<Link href="/(auth)/home" asChild>
					<TouchableOpacity style={styles.navItem}>
						<Ionicons name={isHomeSelected ? "home" : "home-outline"} size={24} color="#4A90E2" />
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
		position: 'relative',
	},
	videoContainer: {
		height: 200,
		width: '100%',
		backgroundColor: '#000',
		overflow: 'hidden',
	},
	video: {
		flex: 1,
		width: '100%',
	},
	contentContainer: {
		flex: 1,
		padding: 16,
		paddingBottom: 80,
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
	section: {
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 16,
		color: '#333',
	},
	statusContainer: {
		gap: 16,
	},
	statusItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	statusTextContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	statusLabel: {
		fontSize: 16,
		color: '#666',
	},
	statusValue: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
	},
	statusNote: {
		fontSize: 14,
		color: '#666',
		fontStyle: 'italic',
	},
	lastUpdate: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginTop: 8,
	},
	lastUpdateText: {
		color: '#666',
		fontSize: 14,
	},
	actionContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 8,
	},
	actionButton: {
		flex: 1,
		backgroundColor: '#F8F9FA',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#E9ECEF',
	},
	refreshContainer: {
		display: 'none',
	},
	actionText: {
		color: '#4A90E2',
		marginTop: 8,
		fontSize: 14,
	},
	criticalText: {
		color: '#FF6B6B',
		fontWeight: 'bold',
	},
	connectionStatus: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		gap: 8,
	},
	connectionText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
	},
	offlineStatus: {
		backgroundColor: '#FFF5F5',
		borderColor: '#FF6B6B',
		borderWidth: 1,
	},
	offlineText: {
		color: '#FF6B6B',
	},
	sensorStatus: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 4,
	},
	sensorStatusText: {
		fontSize: 12,
		color: '#4CAF50',
	},
	sensorOffline: {
		backgroundColor: '#FFF5F5',
		padding: 4,
		borderRadius: 4,
	},
	sensorOfflineText: {
		color: '#FF6B6B',
	},
});

export default Page;

