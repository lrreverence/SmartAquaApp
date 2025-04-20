import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { Video } from 'expo-av';
import { useRef, useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set } from "firebase/database";
import { app } from "../firebase";

const Page = () => {
	const videoRef = useRef(null);
	const [pH, setPH] = useState(0);
	const [waterLevel, setWaterLevel] = useState(0);
	const [minPh, setMinPh] = useState(6.5);
	const [maxPh, setMaxPh] = useState(8.5);
	const [lastWaterChange, setLastWaterChange] = useState<Date | null>(null);
	const pathname = usePathname();
	const isHomeSelected = pathname === '/(auth)/home';

	useEffect(() => {
		// Set up real-time listener for pH data
		const db = getDatabase(app);
		const pHRef = ref(db, 'test/ph');
		const waterLevelRef = ref(db, 'test/water_level');
		const thresholdsRef = ref(db, 'thresholds');
		const lastWaterChangeRef = ref(db, 'last_water_change');
		
		const unsubscribePh = onValue(pHRef, snapshot => {
			const data = snapshot.val();
			if (data !== null) {
				setPH(data);
				// Check if pH is out of range and update last water change
				if (data < minPh || data > maxPh) {
					const currentTime = new Date();
					setLastWaterChange(currentTime);
					set(lastWaterChangeRef, currentTime.toISOString());
				}
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
		};
	}, [minPh, maxPh]);

	const getPhStatus = () => {
		if (pH < minPh || pH > maxPh) {
			return 'Critical';
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
								<Text style={[styles.statusNote, getPhStatus() === 'Critical' ? styles.criticalText : null]}>
									({getPhStatus()})
								</Text>
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
						<TouchableOpacity style={styles.actionButton}>
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
});

export default Page;

