// Browser Notification Utility

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    return notification;
  }
  return null;
};

export const sendAnalysisCompleteNotification = (result) => {
  const settings = JSON.parse(localStorage.getItem('deepfake_settings') || '{}');
  
  if (settings.notifications?.analysis) {
    const isAuthentic = result.authenticity_score > 50;
    sendNotification(
      '✅ Analysis Complete',
      {
        body: `Result: ${isAuthentic ? 'Authentic' : 'AI-Generated'} (${result.authenticity_score}% confidence)`,
        tag: 'analysis-complete',
        icon: '/favicon.ico'
      }
    );
  }
};

export const sendSecurityNotification = (message) => {
  const settings = JSON.parse(localStorage.getItem('deepfake_settings') || '{}');
  
  if (settings.notifications?.security) {
    sendNotification(
      '🔒 Security Alert',
      {
        body: message,
        tag: 'security-alert',
        requireInteraction: true,
        icon: '/favicon.ico'
      }
    );
  }
};

export const sendEmailNotification = (message) => {
  const settings = JSON.parse(localStorage.getItem('deepfake_settings') || '{}');
  
  if (settings.notifications?.email) {
    sendNotification(
      '📧 New Email',
      {
        body: message,
        tag: 'email-notification',
        icon: '/favicon.ico'
      }
    );
  }
};
