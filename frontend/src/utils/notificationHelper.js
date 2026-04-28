/**
 * Notification Helper - Manages browser notifications and in-app notifications
 */

/**
 * Request permission for browser notifications
 * @returns {Promise<boolean>} - true if permission granted or already granted
 */
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    return false;
};

/**
 * Send a browser notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options (body, icon, badge, tag, etc.)
 */
export const sendBrowserNotification = (title, options = {}) => {
    try {
        if (!('Notification' in window)) {
            console.log('Browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'delivery-notification', // Prevents duplicate notifications
                requireInteraction: false,
                ...options
            });

            // Auto-close notification after 8 seconds
            setTimeout(() => notification.close(), 8000);

            return notification;
        }
    } catch (error) {
        console.error('Error sending browser notification:', error);
    }
};

/**
 * Play a notification sound
 * @param {string} soundType - Type of sound to play ('success', 'alert', 'info')
 */
export const playNotificationSound = (soundType = 'alert') => {
    try {
        // Create audio context for sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        switch (soundType) {
            case 'success':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
                gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;

            case 'alert':
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
                gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;

            case 'info':
            default:
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                gain.gain.setValueAtTime(0, audioContext.currentTime + 0.15);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
        }
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
};

/**
 * Format assignment details for notification
 * @param {object} assignment - Assignment object
 * @returns {object} - Formatted notification details
 */
export const formatAssignmentNotification = (assignment) => {
    return {
        title: `🚀 New Delivery Order!`,
        body: `
Shop: ${assignment?.shopName || 'Unknown Shop'}
Items: ${assignment?.items?.length || 0}
To: ${assignment?.deliveryAddress?.text?.substring(0, 40)}...
        `.trim(),
        data: {
            assignmentId: assignment?._id,
            shopName: assignment?.shopName,
            itemCount: assignment?.items?.length,
            deliveryAddress: assignment?.deliveryAddress?.text
        }
    };
};

export default {
    requestNotificationPermission,
    sendBrowserNotification,
    playNotificationSound,
    formatAssignmentNotification
};
