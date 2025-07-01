/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Store the last notification time to avoid spam
let lastNotificationTime = 0;
const COOLDOWN_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

export const monitorPhLevels = functions.database
  .ref("/test/ph")
  .onWrite(async (change) => {
    const newPhValue = change.after.val();
    const previousPhValue = change.before.val();
    
    // Skip if no new value or if value hasn't changed
    if (newPhValue === null || newPhValue === previousPhValue) {
      return null;
    }

    try {
      // Get pH thresholds from database
      const thresholdsSnapshot = await admin.database().ref("/thresholds").once("value");
      const thresholds = thresholdsSnapshot.val();
      
      if (!thresholds) {
        console.log("No thresholds configured");
        return null;
      }

      const minPh = parseFloat(thresholds.minPh) || 6.5;
      const maxPh = parseFloat(thresholds.maxPh) || 8.5;
      
      // Check if pH is outside the normal range
      const isAbnormal = newPhValue < minPh || newPhValue > maxPh;
      
      // Check cooldown period
      const currentTime = Date.now();
      const timeSinceLastNotification = currentTime - lastNotificationTime;
      
      if (isAbnormal && timeSinceLastNotification >= COOLDOWN_DURATION) {
        console.log(`pH level ${newPhValue} is outside normal range (${minPh}-${maxPh})`);
        console.log(`Time since last notification: ${timeSinceLastNotification}ms`);
        
        // Update last notification time
        lastNotificationTime = currentTime;
        
        // Get all user FCM tokens
        const tokensSnapshot = await admin.database().ref("/user_tokens").once("value");
        const tokens = tokensSnapshot.val();
        
        if (tokens) {
          const tokenList = Object.values(tokens) as string[];
          
          // Send push notification to all users
          const notificationPromises = tokenList.map(token => 
            sendPushNotification(token, newPhValue, minPh, maxPh)
          );
          
          await Promise.all(notificationPromises);
          console.log(`Sent push notifications to ${tokenList.length} users`);
        }
      } else if (isAbnormal) {
        const timeRemaining = COOLDOWN_DURATION - timeSinceLastNotification;
        console.log(`pH level ${newPhValue} is abnormal but cooldown active. Time remaining: ${timeRemaining}ms`);
      }
      
      return null;
    } catch (error) {
      console.error("Error monitoring pH levels:", error);
      return null;
    }
  });

async function sendPushNotification(
  token: string, 
  phValue: number, 
  minPh: number, 
  maxPh: number
): Promise<void> {
  try {
    // Determine if pH is too high or too low
    const isTooHigh = phValue > maxPh;
    const isTooLow = phValue < minPh;
    
    let title = "⚠️ pH Level Alert";
    let body = "";
    
    if (isTooHigh) {
      title = "🔴 pH Level Too High";
      body = `pH level is too high (${phValue.toFixed(1)}). Normal range: ${minPh}-${maxPh}. Consider changing water.`;
    } else if (isTooLow) {
      title = "🔵 pH Level Too Low";
      body = `pH level is too low (${phValue.toFixed(1)}). Normal range: ${minPh}-${maxPh}. Consider changing water.`;
    } else {
      title = "⚠️ pH Level Alert";
      body = `pH level is abnormal (${phValue.toFixed(1)}). Normal range: ${minPh}-${maxPh}. Consider changing water.`;
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        phValue: phValue.toString(),
        minPh: minPh.toString(),
        maxPh: maxPh.toString(),
        timestamp: Date.now().toString(),
        type: "ph_alert",
        alertType: isTooHigh ? "high" : isTooLow ? "low" : "abnormal"
      },
      android: {
        priority: "high" as const,
        notification: {
          channelId: "ph_alerts",
          priority: "high" as const,
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

// Function to register user FCM token
export const registerUserToken = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { token } = data;
  const userId = context.auth.uid;

  if (!token) {
    throw new functions.https.HttpsError("invalid-argument", "FCM token is required");
  }

  try {
    // Store the token in the database
    await admin.database().ref(`/user_tokens/${userId}`).set(token);
    console.log(`Registered FCM token for user ${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error registering FCM token:", error);
    throw new functions.https.HttpsError("internal", "Failed to register token");
  }
});

// Function to unregister user FCM token
export const unregisterUserToken = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const userId = context.auth.uid;

  try {
    // Remove the token from the database
    await admin.database().ref(`/user_tokens/${userId}`).remove();
    console.log(`Unregistered FCM token for user ${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error unregistering FCM token:", error);
    throw new functions.https.HttpsError("internal", "Failed to unregister token");
  }
});
