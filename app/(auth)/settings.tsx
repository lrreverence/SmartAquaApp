import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { getDatabase, ref, set, onValue } from "firebase/database";
import { app } from "../firebase";

const Settings = () => {
	const router = useRouter();
	const [pushAlerts, setPushAlerts] = useState(true);
	const [emailAlerts, setEmailAlerts] = useState(true);
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

		try {
			const db = getDatabase(app);
			await set(ref(db, 'thresholds'), {
				minPh,
				maxPh
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
					<Text style={styles.header}>⚙️ User Settings</Text>
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
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		paddingBottom: 10,
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
});

export default Settings; 