import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Video } from 'expo-av';
import { useRef } from 'react';

const Page = () => {
	const videoRef = useRef(null);

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
								<Text style={styles.statusValue}>7.2</Text>
								<Text style={styles.statusNote}>(Normal)</Text>
							</View>
						</View>
						<View style={styles.statusItem}>
							<Ionicons name="thermometer-outline" size={24} color="#4A90E2" />
							<View style={styles.statusTextContainer}>
								<Text style={styles.statusLabel}>Water Level:</Text>
								<Text style={styles.statusValue}>75%</Text>
								<Text style={styles.statusNote}>(Stable)</Text>
							</View>
						</View>
						<View style={styles.lastUpdate}>
							<Ionicons name="time-outline" size={16} color="#666" />
							<Text style={styles.lastUpdateText}>Last Water Change: 3 Hours Ago</Text>
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
						<Link href="/(auth)/manual-control" asChild>
							<TouchableOpacity style={styles.actionButton}>
								<Ionicons name="hand-right-outline" size={24} color="#4A90E2" />
								<Text style={styles.actionText}>Manual Override</Text>
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
						<Ionicons name="home-outline" size={24} color="#FF6B6B" />
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
		flexWrap: 'wrap',
		gap: 16,
		justifyContent: 'space-between',
	},
	actionButton: {
		flexBasis: '45%',
		backgroundColor: '#F8F9FA',
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#E9ECEF',
	},
	actionText: {
		color: '#4A90E2',
		marginTop: 8,
		fontSize: 14,
	},
});

export default Page;

