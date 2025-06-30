import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import { getDatabase, ref, set } from 'firebase/database';
import { app } from './firebase';
import NotificationService from './services/NotificationService';

export default function RootLayout() {
	const [initializing, setInitializing] = useState(true);
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
	const router = useRouter();
	const segments = useSegments();

	const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
		console.log('onAuthStateChanged', user);
		setUser(user);
		if (initializing) setInitializing(false);
	};

	// Initialize notification service only after user is authenticated
	useEffect(() => {
		if (!user) return; // Don't initialize if user is not authenticated

		const initializeNotifications = async () => {
			try {
				const notificationService = NotificationService.getInstance();
				
				// Create notification channel for Android
				await notificationService.createNotificationChannel();
				
				// Register for push notifications
				await notificationService.registerForPushNotifications();
				
				console.log('Notification service initialized successfully');
			} catch (error) {
				console.error('Error initializing notification service:', error);
			}
		};

		initializeNotifications();

		// Cleanup on unmount
		return () => {
			const notificationService = NotificationService.getInstance();
			notificationService.cleanup();
		};
	}, [user]); // Only run when user changes

	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return subscriber;
	}, []);

	useEffect(() => {
		if (initializing) return;

		const inAuthGroup = segments[0] === '(auth)';

		if (user && !inAuthGroup) {
			router.replace('/(auth)/home');
		} else if (!user && inAuthGroup) {
			router.replace('/');
		}
	}, [user, initializing]);

	if (initializing)
		return (
			<View
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					flex: 1
				}}
			>
				<ActivityIndicator size="large" />
			</View>
		);

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
		</Stack>
	);
}