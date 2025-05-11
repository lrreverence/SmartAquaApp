import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import PushNotificationService from './services/pushNotifications';
import { getDatabase, ref, set } from 'firebase/database';
import { app } from './firebase';

export default function RootLayout() {
	const [initializing, setInitializing] = useState(true);
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
	const router = useRouter();
	const segments = useSegments();

	const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
		console.log('onAuthStateChanged', user);
		setUser(user);
		if (initializing) setInitializing(false);

		// Initialize push notifications when user is logged in
		if (user) {
			const pushService = PushNotificationService.getInstance();
			const hasPermission = await pushService.requestUserPermission();
			if (hasPermission) {
				const token = await pushService.getExpoPushToken();
				if (token) {
					// Save the token to Firebase for this user
					const db = getDatabase(app);
					await set(ref(db, `thresholds/${user.uid}/expoPushToken`), token);
				}
				pushService.setupNotificationListeners();
			}
		}
	};

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