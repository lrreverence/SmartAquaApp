import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';

const Settings = () => {
	const router = useRouter();
	const [pushAlerts, setPushAlerts] = useState(true);
	const [emailAlerts, setEmailAlerts] = useState(true);
	const [minPh, setMinPh] = useState(6.5);
	const [maxPh, setMaxPh] = useState(7.5);

	const handleLogout = async () => {
		try {
			await auth().signOut();
			router.replace('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.header}>⚙️ User Settings</Text>
				
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>📊 pH Threshold Settings</Text>
					<Text style={styles.phRange}>[ Min pH: {minPh} ] - [ Max pH: {maxPh} ]</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>🔔 Notification Preferences</Text>
					<View style={styles.preference}>
						<Text>Push Alerts</Text>
						<Switch
							value={pushAlerts}
							onValueChange={setPushAlerts}
							trackColor={{ false: '#767577', true: '#81b0ff' }}
						/>
					</View>
					<View style={styles.preference}>
						<Text>Email Alerts</Text>
						<Switch
							value={emailAlerts}
							onValueChange={setEmailAlerts}
							trackColor={{ false: '#767577', true: '#81b0ff' }}
						/>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>🔧 System Calibration</Text>
					<View style={styles.buttonRow}>
						<TouchableOpacity style={[styles.button, styles.dangerButton]}>
							<Text style={styles.buttonText}>Reset Sensors</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Text style={styles.buttonText}>Test Pumps</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>❓ Help & Instructions</Text>
					<View style={styles.helpSection}>
						<Text style={styles.helpTitle}>Getting Started</Text>
						<Text style={styles.helpText}>1. Set your desired pH range using the threshold settings above</Text>
						<Text style={styles.helpText}>2. Configure your notification preferences to receive alerts</Text>
						<Text style={styles.helpText}>3. Monitor your aquarium's pH levels in real-time</Text>
						
						<Text style={styles.helpTitle}>System Calibration</Text>
						<Text style={styles.helpText}>• Use "Reset Sensors" to recalibrate your pH sensors</Text>
						<Text style={styles.helpText}>• "Test Pumps" verifies your dosing system functionality</Text>
						
						<Text style={styles.helpTitle}>Troubleshooting</Text>
						<Text style={styles.helpText}>• Ensure sensors are properly submerged</Text>
						<Text style={styles.helpText}>• Check for any error notifications</Text>
						<Text style={styles.helpText}>• Contact support if issues persist</Text>
					</View>
				</View>

				<View style={styles.actionButtons}>
					<TouchableOpacity style={[styles.button, styles.saveButton]}>
						<Text style={styles.buttonText}>Save Changes</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.button, styles.cancelButton]}>
						<Text style={styles.buttonText}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</View>

			<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
				<Ionicons name="log-out-outline" size={24} color="#fff" />
				<Text style={styles.logoutText}>Log Out</Text>
			</TouchableOpacity>
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
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 20,
		textAlign: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		paddingBottom: 10,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		marginBottom: 12,
	},
	phRange: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
	},
	preference: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 12,
	},
	button: {
		flex: 1,
		backgroundColor: '#007AFF',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	dangerButton: {
		backgroundColor: '#E57373',
	},
	saveButton: {
		backgroundColor: '#34C759',
	},
	cancelButton: {
		backgroundColor: '#9E9E9E',
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	actionButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 12,
		marginTop: 24,
	},
	logoutButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#757575',
		padding: 16,
		borderRadius: 8,
		marginTop: 'auto',
		marginBottom: 16,
		gap: 8,
	},
	logoutText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
	helpSection: {
		backgroundColor: '#F8F9FA',
		padding: 16,
		borderRadius: 8,
	},
	helpTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginTop: 12,
		marginBottom: 8,
	},
	helpText: {
		fontSize: 14,
		color: '#666',
		marginBottom: 4,
		lineHeight: 20,
	},
});

export default Settings; 