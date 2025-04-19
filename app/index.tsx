import React, { useState } from 'react';
import {
	Text,
	View,
	StyleSheet,
	KeyboardAvoidingView,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	Platform,
	Image
} from 'react-native';
import { Checkbox } from 'expo-checkbox';
import auth from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';

export default function Index() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [verificationCode, setVerificationCode] = useState('');
	const [isVerifying, setIsVerifying] = useState(false);

	const signUp = async () => {
		setLoading(true);
		try {
			const userCredential = await auth().createUserWithEmailAndPassword(email, password);
			await userCredential.user.sendEmailVerification();
			setIsVerifying(true);
			alert('Check your email for a verification');
		} catch (e: any) {
			const err = e as FirebaseError;
			alert('Registration failed: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const verifyEmail = async () => {
		if (verificationCode.length !== 6) {
			alert('Please enter a valid 6-digit code');
			return;
		}

		setLoading(true);
		try {
			const user = auth().currentUser;
			if (user) {
				await user.reload();
				if (user.emailVerified) {
					alert('Email verified successfully!');
					setIsVerifying(false);
				} else {
					alert('Verification failed. Please try again or request a new code.');
				}
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			alert('Verification failed: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const resendVerificationCode = async () => {
		setLoading(true);
		try {
			const user = auth().currentUser;
			if (user) {
				await user.sendEmailVerification();
				alert('A new verification code has been sent to your email.');
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			alert('Failed to resend verification code: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const signIn = async () => {
		setLoading(true);
		try {
			await auth().signInWithEmailAndPassword(email, password);
			if (rememberMe) {
				// Here you would typically store the credentials securely
				// For example, using AsyncStorage or a secure keychain
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			alert('Sign in failed: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const forgotPassword = async () => {
		if (!email) {
			alert('Please enter your email address');
			return;
		}
		setLoading(true);
		try {
			await auth().sendPasswordResetEmail(email);
			alert('Password reset email sent! Please check your inbox.');
		} catch (e: any) {
			const err = e as FirebaseError;
			alert('Failed to send reset email: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<KeyboardAvoidingView 
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardView}
			>
				<View style={styles.formContainer}>
					<View style={styles.headerContainer}>
						<Image 
							source={require('../assets/images/fish-bowl.png')}
							style={styles.appIcon}
							resizeMode="contain"
						/>
						<Text style={styles.appName}>Smart Aquarium</Text>
						<Text style={styles.subtitle}>Monitor your aquatic world</Text>
					</View>
					
					<TextInput
						style={styles.input}
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						keyboardType="email-address"
						placeholder="Email"
						placeholderTextColor="#666"
					/>
					<TextInput
						style={styles.input}
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						placeholder="Password"
						placeholderTextColor="#666"
					/>

					{isVerifying && (
						<>
							<TextInput
								style={styles.input}
								value={verificationCode}
								onChangeText={setVerificationCode}
								keyboardType="number-pad"
								placeholder="Enter 6-digit verification code"
								placeholderTextColor="#666"
								maxLength={6}
							/>
							<View style={styles.verificationButtons}>
								<TouchableOpacity style={styles.verifyButton} onPress={verifyEmail}>
									<Text style={styles.verifyButtonText}>Verify</Text>
								</TouchableOpacity>
								<TouchableOpacity onPress={resendVerificationCode}>
									<Text style={styles.resendText}>Resend Code</Text>
								</TouchableOpacity>
							</View>
						</>
					)}
					
					<View style={styles.optionsContainer}>
						<View style={styles.rememberMeContainer}>
							<Checkbox
								value={rememberMe}
								onValueChange={setRememberMe}
								color={rememberMe ? '#00BCD4' : '#B2EBF2'}
							/>
							<Text style={styles.rememberMeText}>Remember me</Text>
						</View>
						<TouchableOpacity onPress={forgotPassword}>
							<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
						</TouchableOpacity>
					</View>
					
					{loading ? (
						<ActivityIndicator size="large" color="#00BCD4" style={styles.loader} />
					) : (
						<View style={styles.buttonContainer}>
							<TouchableOpacity style={styles.primaryButton} onPress={signIn}>
								<Text style={styles.primaryButtonText}>Sign In</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.secondaryButton} onPress={signUp}>
								<Text style={styles.secondaryButtonText}>Create Account</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#E3F2FD',
	},
	keyboardView: {
		flex: 1,
	},
	formContainer: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
	},
	headerContainer: {
		alignItems: 'center',
		marginBottom: 40,
	},
	appIcon: {
		width: 100,
		height: 100,
		marginBottom: 16,
	},
	appName: {
		fontSize: 36,
		fontWeight: 'bold',
		color: '#006064',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: '#00838F',
		fontStyle: 'italic',
	},
	input: {
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		fontSize: 16,
		borderWidth: 1,
		borderColor: '#B2EBF2',
	},
	optionsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	rememberMeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	rememberMeText: {
		color: '#00838F',
		marginLeft: 8,
		fontSize: 14,
	},
	forgotPasswordText: {
		color: '#00BCD4',
		fontSize: 14,
		textDecorationLine: 'underline',
	},
	buttonContainer: {
		marginTop: 24,
	},
	primaryButton: {
		backgroundColor: '#00BCD4',
		padding: 16,
		borderRadius: 8,
		marginBottom: 12,
	},
	primaryButtonText: {
		color: '#fff',
		textAlign: 'center',
		fontSize: 16,
		fontWeight: '600',
	},
	secondaryButton: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#00BCD4',
	},
	secondaryButtonText: {
		color: '#00BCD4',
		textAlign: 'center',
		fontSize: 16,
		fontWeight: '600',
	},
	loader: {
		marginTop: 24,
	},
	verificationButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	verifyButton: {
		backgroundColor: '#00BCD4',
		padding: 12,
		borderRadius: 8,
		flex: 1,
		marginRight: 12,
	},
	verifyButtonText: {
		color: '#fff',
		textAlign: 'center',
		fontSize: 16,
		fontWeight: '600',
	},
	resendText: {
		color: '#00BCD4',
		fontSize: 14,
		textDecorationLine: 'underline',
	},
});