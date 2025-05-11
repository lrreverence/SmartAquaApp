import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('./smart-aqua-app-firebase-adminsdk-fbsvc-9bdddba411.json');

if (!admin.apps.length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    const response = await getMessaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const sendPushNotificationToTopic = async (
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    const response = await getMessaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}; 