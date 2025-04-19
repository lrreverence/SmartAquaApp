import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useRouter, Link } from 'expo-router';
import { getDatabase, ref, set, onValue } from "firebase/database";
import { app } from "../firebase";

const Settings = () => {
	const router = useRouter();
	const [pushAlerts, setPushAlerts] = useState(true);
	const [emailAlerts, setEmailAlerts] = useState(true);
	const [emailAddress, setEmailAddress] = useState('');
	const [minPh, setMinPh] = useState(6.5);
	const [maxPh, setMaxPh] = useState(7.5);

	useEffect(() => {
		// Load threshold values from Firebase
		const db = getDatabase(app);
		const thresholdsRef = ref(db, 'thresholds');
		
		const unsubscribe = onValue(thresholdsRef, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				setMinPh(data.minPh || 6.5);
				setMaxPh(data.maxPh || 7.5);
				setEmailAddress(data.emailAddress || '');
			}
		});

		return () => unsubscribe();
	}, []);

	const handleLogout = async () => {
		try {
			await auth().signOut();
			router.replace('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	const handleSave = async () => {
		if (minPh >= maxPh) {
			Alert.alert(
				"Invalid pH Range",
				"Minimum pH must be less than maximum pH",
				[{ text: "OK" }]
			);
			return;
		}

		if (emailAlerts && !emailAddress) {
			Alert.alert(
				"Email Required",
				"Please enter an email address for email alerts",
				[{ text: "OK" }]
			);
			return;
		}

		try {
			const db = getDatabase(app);
			await set(ref(db, 'thresholds'), {
				minPh,
				maxPh,
				emailAddress
			});
			
			Alert.alert(
				"Success",
				"Settings saved successfully!",
				[{ text: "OK" }]
			);
		} catch (error) {
			Alert.alert(
				"Error",
				"Failed to save settings. Please try again.",
				[{ text: "OK" }]
			);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<View style={styles.headerContainer}>
					<View style={styles.headerLeft}>
						<TouchableOpacity 
							style={styles.backButton}
							onPress={() => router.back()}
						>
							<Ionicons name="arrow-back" size={24} color="#666" />
						</TouchableOpacity>
						<Text style={styles.header}>⚙️ User Settings</Text>
					</View>
					<TouchableOpacity 
						style={styles.helpIcon}
						onPress={() => router.push('/help')}
					>
						<Ionicons name="help-circle-outline" size={24} color="#666" />
					</TouchableOpacity>
				</View>
				
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>📊 pH Threshold Settings</Text>
					<View style={styles.phInputContainer}>
						<View style={styles.phInput}>
							<Text style={styles.phLabel}>Min pH:</Text>
							<TextInput
								style={styles.input}
								value={minPh.toString()}
								onChangeText={(text) => {
									const value = parseFloat(text);
									if (!isNaN(value)) {
										setMinPh(value);
									}
								}}
								keyboardType="numeric"
								placeholder="6.5"
							/>
						</View>
						<View style={styles.phInput}>
							<Text style={styles.phLabel}>Max pH:</Text>
							<TextInput
								style={styles.input}
								value={maxPh.toString()}
								onChangeText={(text) => {
									const value = parseFloat(text);
									if (!isNaN(value)) {
										setMaxPh(value);
									}
								}}
								keyboardType="numeric"
								placeholder="7.5"
							/>
						</View>
					</View>
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
					{emailAlerts && (
						<View style={styles.emailInput}>
							<Text style={styles.emailLabel}>Email Address:</Text>
							<TextInput
								style={styles.input}
								value={emailAddress}
								onChangeText={setEmailAddress}
								keyboardType="email-address"
								placeholder="Enter your email"
								autoCapitalize="none"
							/>
						</View>
					)}
				</View>

				<View style={styles.actionButtons}>
					<TouchableOpacity 
						style={[styles.button, styles.saveButton]}
						onPress={handleSave}
					>
						<Text style={styles.buttonText}>Save Changes</Text>
					</TouchableOpacity>
					<TouchableOpacity 
						style={[styles.button, styles.cancelButton]}
						onPress={() => {
							// Reset to default values
							setMinPh(6.5);
							setMaxPh(7.5);
						}}
					>
						<Text style={styles.buttonText}>Cancel</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity 
					style={styles.logoutButton} 
					onPress={handleLogout}
				>
					<Ionicons name="log-out-outline" size={24} color="#fff" />
					<Text style={styles.logoutText}>Log Out</Text>
				</TouchableOpacity>
			</View>

			{/* Navigation Bar */}
			<View style={styles.navbar}>
				<Link href="/(auth)/home" asChild>
					<TouchableOpacity style={styles.navItem}>
						<Ionicons name="home-outline" size={24} color="#4A90E2" />
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
						<Ionicons name="settings" size={24} color="#4A90E2" />
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
		marginBottom: 80, // Add space for navbar
	},
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		paddingBottom: 10,
	},
	headerLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	backButton: {
		padding: 8,
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
	},
	helpIcon: {
		padding: 8,
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
	phInputContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 12,
		marginTop: 8,
	},
	phInput: {
		flex: 1,
	},
	phLabel: {
		fontSize: 14,
		color: '#666',
		marginBottom: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 8,
		fontSize: 16,
		backgroundColor: '#fff',
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
		backgroundColor: '#FF3B30',
		padding: 16,
		borderRadius: 8,
		marginTop: 16,
		gap: 8,
	},
	logoutText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
	emailInput: {
		marginTop: 8,
	},
	emailLabel: {
		fontSize: 14,
		color: '#666',
		marginBottom: 4,
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

export default Settings; 