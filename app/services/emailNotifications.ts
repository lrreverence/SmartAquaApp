import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";

class EmailNotificationService {
  private static instance: EmailNotificationService;
  private db: ReturnType<typeof getDatabase>;

  private constructor() {
    this.db = getDatabase(app);
  }

  public static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  public async sendEmailAlert(
    email: string,
    subject: string,
    message: string
  ): Promise<void> {
    try {
      // Call Firebase Cloud Function to send email
      const response = await fetch('https://us-central1-smart-aqua-app.cloudfunctions.net/sendEmailAlert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email alert');
      }
    } catch (error) {
      console.error('Error sending email alert:', error);
      throw error;
    }
  }

  public async checkAndSendAlerts(
    currentPh: number,
    minPh: number,
    maxPh: number
  ): Promise<void> {
    try {
      // Get user's email preferences
      const thresholdsRef = ref(this.db, 'thresholds');
      const snapshot = await onValue(thresholdsRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.emailAlerts && data.emailAddress) {
          if (currentPh < minPh || currentPh > maxPh) {
            const subject = '⚠️ pH Level Alert';
            const message = `Your aquarium's pH level (${currentPh.toFixed(1)}) is outside the safe range (${minPh}-${maxPh}). Please take action to stabilize the water parameters.`;
            
            this.sendEmailAlert(data.emailAddress, subject, message);
          }
        }
      });
    } catch (error) {
      console.error('Error checking and sending alerts:', error);
      throw error;
    }
  }
}

export default EmailNotificationService; 