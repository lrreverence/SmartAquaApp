import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Help = () => {
	const router = useRouter();

	return (
		<View style={styles.card}>
			<View style={styles.headerContainer}>
				<TouchableOpacity 
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<Ionicons name="arrow-back" size={24} color="#333" />
				</TouchableOpacity>
				<Text style={styles.header}>❓ Help & Instructions</Text>
			</View>

			<ScrollView style={styles.content}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Getting Started</Text>
					<Text style={styles.helpText}>1. Set your desired pH range using the threshold settings</Text>
					<Text style={styles.helpText}>2. Configure your notification preferences to receive alerts</Text>
					<Text style={styles.helpText}>3. Monitor your aquarium's pH levels in real-time</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>System Calibration</Text>
					<Text style={styles.helpText}>• Use "Reset Sensors" to recalibrate your pH sensors</Text>
					<Text style={styles.helpText}>• "Test Pumps" verifies your dosing system functionality</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Troubleshooting</Text>
					<Text style={styles.helpText}>• Ensure sensors are properly submerged</Text>
					<Text style={styles.helpText}>• Check for any error notifications</Text>
					<Text style={styles.helpText}>• Contact support if issues persist</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Contact Support</Text>
					<Text style={styles.helpText}>Email: rosroslang@gmail.com</Text>
					<Text style={styles.helpText}>Phone: +63930 153 1356</Text>
					<Text style={styles.helpText}>Hours: Mon-Fri, 9AM-5PM PHT</Text>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		flex: 1,
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
		alignItems: 'center',
		marginBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		paddingBottom: 10,
	},
	backButton: {
		marginRight: 12,
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#000000',
		flex: 1,
	},
	content: {
		flex: 1,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000000',
		marginBottom: 12,
	},
	helpText: {
		fontSize: 16,
		color: '#000000',
		marginBottom: 8,
		lineHeight: 24,
	},
});

export default Help; 