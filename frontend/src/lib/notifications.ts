import { LocalNotifications } from '@capacitor/local-notifications';

// Helper: Convert Mongo Hex ID to a generic Integer ID
// This ensures that "Snooze" overwrites the "Original" notification automatically
const getNotificationId = (mongoId: string) => {
    // Take the last 6 characters of the hex string and convert to integer
    const partial = mongoId.slice(-6); 
    return parseInt(partial, 16);
};

export const scheduleNotification = async (reminder: any) => {
    try {
        // 1. Ask for permission (only needed once, but safe to call repeatedly)
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
             await LocalNotifications.requestPermissions();
        }

        const remindDate = new Date(reminder.remind_at);
        
        // Don't schedule past events
        if (remindDate.getTime() < Date.now()) return;

        const notifId = getNotificationId(reminder._id);

        // 2. Build the Body Text
        let bodyText = reminder.title;
        if (reminder.extra_info) {
            bodyText += `\n📝 ${reminder.extra_info}`;
        }

        // 3. Schedule (Overwrites any existing notification with this ID)
        await LocalNotifications.schedule({
            notifications: [
                {
                    id: notifId, // <--- Deterministic ID
                    title: "Rheminda",
                    body: bodyText,
                    schedule: { at: remindDate },
                    channelId: 'rheminda_urgent', // Must match the channel created in page.tsx
                    actionTypeId: 'REMINDER_ACTIONS',
                    extra: { reminderId: reminder._id },
                    smallIcon: 'ic_stat_icon', 
                    iconColor: '#2563EB',
                }
            ]
        });
        
    } catch (e) {
        console.error("Notification Schedule Failed", e);
    }
};

export const cancelNotification = async (reminderId: string) => {
    const notifId = getNotificationId(reminderId);
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
};

export const initializeNotifications = async () => {
    // 1. Create Channel (Android Only)
    await LocalNotifications.createChannel({
        id: 'rheminda_urgent',
        name: 'Rheminda Alerts',
        description: 'High priority reminders',
        importance: 5, 
        visibility: 1,
        sound: 'beep.wav',
        vibration: true,
    });

    // 2. Register Actions (Buttons)
    await LocalNotifications.registerActionTypes({
        types: [
            {
                id: 'REMINDER_ACTIONS',
                actions: [
                    { id: 'snooze', title: '💤 Snooze 10m', foreground: false },
                    { id: 'complete', title: '✅ Mark Done', foreground: false }
                ]
            }
        ]
    });
};