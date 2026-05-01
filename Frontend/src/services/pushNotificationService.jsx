/**
 * Push Notification Service
 * Handles FCM token registration and notification handling
 */

import { messaging, getToken, onMessage } from '../firebase';
import { toast } from 'react-hot-toast';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Check if running inside Flutter WebView
 * @returns {boolean}
 */
function isFlutterWebView() {
  return !!(window.flutter_inappwebview && window.flutter_inappwebview.callHandler);
}

/**
 * Get the current platform type
 * @returns {'web' | 'mobile'}
 */
function getPlatformType() {
  return isFlutterWebView() ? 'mobile' : 'web';
}

/**
 * Register service worker for push notifications
 * @returns {Promise<ServiceWorkerRegistration>}
 */
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  } else {
    throw new Error('Service Workers are not supported in this browser');
  }
}

/**
 * Request notification permission from user
 * @returns {Promise<boolean>}
 */
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied');
      toast.error('Notification permission denied! Please enable it in browser settings to receive alerts.', {
        id: 'fcm-permission-denied',
        duration: 5000
      });
      return false;
    }
  }
  console.log('❌ Notifications not supported');
  return false;
}

/**
 * Get FCM token from Firebase
 * @returns {Promise<string|null>}
 */
async function getFCMToken() {
  try {
    if (!messaging) {
      return null;
    }

    const registration = await registerServiceWorker();
    await registration.update(); // Update service worker

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      return token;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Register FCM token with backend
 * @param {string} userType - 'user', 'vendor', or 'worker'
 * @param {boolean} forceUpdate - Force token update
 * @returns {Promise<string|null>}
 */
async function registerFCMToken(userType = 'user', forceUpdate = false) {
  try {
    const platform = getPlatformType();
    const storageKey = `fcm_token_${userType}_${platform}`;

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    const token = await getFCMToken();
    if (!token) {
      return null;
    }

    let endpoint;
    let authTokenKey;
    switch (userType) {
      case 'vendor':
        endpoint = '/vendors/fcm-tokens/save';
        authTokenKey = 'vendorAccessToken';
        break;
      case 'worker':
        endpoint = '/workers/fcm-tokens/save';
        authTokenKey = 'workerAccessToken';
        break;
      case 'user':
        endpoint = '/users/fcm-tokens/save';
        authTokenKey = 'accessToken';
        break;
      default:
        endpoint = '/users/fcm-tokens/save';
        authTokenKey = 'accessToken';
    }

    const authToken = localStorage.getItem(authTokenKey);
    if (!authToken) {
      return null;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    console.log(`[FCM] Saving to backend: ${baseUrl}${endpoint}`);

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        token: token,
        platform: 'web'
      })
    });

    const responseData = await response.json();

    if (response.ok) {
      localStorage.setItem(storageKey, token);
      console.log('[FCM] ✅ FCM token registered with backend successfully!');
      return token;
    } else {
      console.error('[FCM] ❌ Failed to register token with backend:', responseData);
      return null;
    }
  } catch (error) {
    console.error('[FCM] ❌ CRITICAL ERROR during registration:', error);
    return null;
  }
}

/**
 * Remove FCM token from backend
 * @param {string} userType - 'user', 'vendor', or 'worker'
 */
async function removeFCMToken(userType = 'user') {
  try {
    const platform = getPlatformType();
    const storageKey = `fcm_token_${userType}_${platform}`;
    const tokenToRemove = localStorage.getItem(storageKey);

    if (!tokenToRemove) {
      return;
    }

    let endpoint;
    let authTokenKey;
    switch (userType) {
      case 'vendor':
        endpoint = '/vendors/fcm-tokens/remove';
        authTokenKey = 'vendorAccessToken';
        break;
      case 'worker':
        endpoint = '/workers/fcm-tokens/remove';
        authTokenKey = 'workerAccessToken';
        break;
      default:
        endpoint = '/users/fcm-tokens/remove';
        authTokenKey = 'accessToken';
    }

    const authToken = localStorage.getItem(authTokenKey);
    if (authToken) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token: tokenToRemove,
          platform: platform
        })
      });
      console.log(`[FCM] ✅ Token removed from backend`);
    }

    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('[FCM] Error removing FCM token:', error);
    const platform = getPlatformType();
    const storageKey = `fcm_token_${userType}_${platform}`;
    localStorage.removeItem(storageKey);
  }
}

const shownNotifications = new Set();
let foregroundListenerRegistered = false;

/**
 * Setup foreground notification handler
 * @param {Function} handler - Custom handler function
 */
function setupForegroundNotificationHandler(handler) {
  console.log('[FCM] 🛠 Setting up foreground notification handler...');
  
  if (!messaging) {
    console.warn('[FCM] ⚠️ Messaging not initialized yet. Retrying in 1s...');
    setTimeout(() => setupForegroundNotificationHandler(handler), 1000);
    return;
  }

  if (foregroundListenerRegistered) {
    console.log('[FCM] ℹ️ Foreground listener already registered.');
    return;
  }
  foregroundListenerRegistered = true;

  console.log('[FCM] ✅ Registering onMessage listener...');
  
  const unsubscribe = onMessage(messaging, async (payload) => {
    console.log('📬 [FCM] Foreground message received:', payload);
    const notification = payload.notification || {};
    const data = payload.data || {};
    const title = notification.title || data.title || 'New Notification';
    const body = notification.body || data.body || '';
    const notificationId = data.notificationId;
    const type = data.type || 'default';

    if (notificationId && notificationId !== 'test-notification' && shownNotifications.has(notificationId)) {
      console.log('[FCM] 🚫 Deduplicated foreground message:', notificationId);
      return;
    }
    
    if (notificationId) {
      shownNotifications.add(notificationId);
      setTimeout(() => shownNotifications.delete(notificationId), 60000);
    }

    const icon = notification.icon || data.icon || '/truliq-logo.png';

    // 1. Play Sound based on type
    try {
      const { playNotificationSound, playAlertRing } = await import('../utils/notificationSound');
      if (['new_booking', 'job_assigned', 'test'].includes(type)) {
        console.log('[FCM] 🔊 Playing alert ring...');
        playAlertRing(false); 
      } else {
        console.log('[FCM] 🔊 Playing notification sound...');
        playNotificationSound();
      }
    } catch (soundErr) {
      console.error('[FCM] ❌ Failed to play notification sound:', soundErr);
    }

    let notificationShown = false;

    // 2. Show System Notification (Browser level)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification(title, {
            body: body,
            icon: icon,
            badge: '/truliq-logo.png',
            data: data,
            tag: data.notificationId || data.tag || 'truliq-alert',
            renotify: true
          });
          notificationShown = true;
          console.log('[FCM] ✅ System notification triggered');
        }
      } catch (err) {
        console.error('[FCM] ❌ Error showing system notification:', err);
      }
    }

    // 3. ALWAYS Show Internal Alert in Foreground (Premium Toast)
    try {
      console.log('[FCM] 🎨 Rendering custom toast...');
      toast.custom((t) => (
        <div 
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-orange-500 overflow-hidden cursor-pointer`}
          onClick={() => {
            toast.dismiss(t.id);
            if (data.link) window.location.href = data.link;
          }}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg">
                  <img className="h-10 w-10 rounded-full border-2 border-white/50" src={icon} alt="" onError={(e) => e.target.src = '/truliq-logo.png'} />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
                <p className="mt-1 text-xs text-gray-600 font-medium line-clamp-2">{body}</p>
                <div className="mt-2 flex items-center gap-2">
                   <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-orange-100">
                     {type.replace('_', ' ')}
                   </span>
                   <span className="text-[10px] font-bold text-gray-400">Just now</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-gray-600 focus:outline-none bg-gray-50/50"
            >
              ✕
            </button>
          </div>
        </div>
      ), { duration: 8000, position: 'top-right' });
    } catch (toastErr) {
      console.error('[FCM] ❌ Toast fallback failed:', toastErr);
    }

    // 4. Fallback: Use native Notification API if needed
    if (!notificationShown && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon });
      } catch (err) {
        console.error('[FCM] ❌ Native Notification failed:', err);
      }
    }

    // 5. Dispatch global event for components to react
    window.dispatchEvent(new CustomEvent('appNotificationReceived', { 
      detail: { ...payload, title, body, type } 
    }));

    if (handler) {
      handler(payload);
    }
  });

  return unsubscribe;
}

/**
 * Initialize push notifications
 */
let swMessageListenerRegistered = false;

async function initializePushNotifications() {
  try {
    console.log('[FCM] 🚀 Initializing push notifications...');
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      console.warn('[FCM] ⚠️ Browser does not support service workers or notifications');
      return;
    }
    await registerServiceWorker();

    // Prevent double registration of SW message listener
    if (swMessageListenerRegistered) {
      console.log('[FCM] ℹ️ SW message listener already registered.');
      return;
    }
    swMessageListenerRegistered = true;

    // ✅ PRIMARY: Listen for messages relayed from Service Worker
    navigator.serviceWorker.addEventListener('message', async (event) => {
      const { type, payload } = event.data || {};
      
      if (type !== 'FCM_FOREGROUND_MESSAGE') return;
      
      console.log('[FCM] ✅ SW relayed foreground message:', payload);
      
      const title = payload.title || 'New Notification';
      const body = payload.body || '';
      const notifType = payload.type || 'default';
      const icon = payload.icon || '/truliq-logo.png';

      // 1. Play sound
      try {
        const { playNotificationSound, playAlertRing } = await import('../utils/notificationSound');
        if (['new_booking', 'job_assigned', 'test'].includes(notifType)) {
          playAlertRing(false);
        } else {
          playNotificationSound();
        }
      } catch (e) {
        console.warn('[FCM] Sound error:', e);
      }

      // 2. Show premium toast
      try {
        const { toast } = await import('react-hot-toast');
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-orange-500 overflow-hidden cursor-pointer`}
            onClick={() => {
              toast.dismiss(t.id);
              if (payload.link) window.location.href = payload.link;
            }}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                    <img className="h-10 w-10 rounded-full border-2 border-white/50" src={icon} alt="" onError={(e) => e.target.src = '/truliq-logo.png'} />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
                  <p className="mt-1 text-xs text-gray-600 font-medium line-clamp-2">{body}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-orange-100">
                      {notifType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">Just now</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-100">
              <button
                onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-gray-600 focus:outline-none bg-gray-50/50"
              >
                ✕
              </button>
            </div>
          </div>
        ), { duration: 8000, position: 'top-right', id: `fcm-${payload.notificationId || Date.now()}` });
      } catch (toastErr) {
        console.error('[FCM] Toast error:', toastErr);
      }

      // 3. Dispatch global event for Dashboard modal etc.
      window.dispatchEvent(new CustomEvent('appNotificationReceived', {
        detail: {
          data: payload,
          title,
          body,
          type: notifType
        }
      }));
    });

    console.log('[FCM] ✅ SW message listener registered.');
    
    // Debug utility
    window.fcmDebug = async () => {
      console.log('--- FCM Debug Info ---');
      console.log('Permission:', Notification.permission);
      console.log('Messaging Object:', !!messaging);
      const reg = await navigator.serviceWorker.getRegistration();
      console.log('SW Registration Status:', !!reg);
      if (reg) console.log('SW Scope:', reg.scope);
      try {
        const token = await getFCMToken();
        console.log('FCM Token:', token);
        return { permission: Notification.permission, hasMessaging: !!messaging, hasSW: !!reg, token };
      } catch (e) {
        console.error('Token retrieval failed:', e);
        return { permission: Notification.permission, hasMessaging: !!messaging, hasSW: !!reg, error: e.message };
      }
    };

    // Manual UI test
    window.testLocalFCMUI = async () => {
      console.log('[FCM Debug] Triggering local UI test...');
      // Simulate SW postMessage
      const fakeEvent = new MessageEvent('message', {
        data: {
          type: 'FCM_FOREGROUND_MESSAGE',
          payload: {
            title: '🔔 Test Notification',
            body: 'This is a simulated foreground notification. Working correctly!',
            type: 'test',
            notificationId: `test-${Date.now()}`,
            link: '/worker/dashboard'
          }
        }
      });
      navigator.serviceWorker.dispatchEvent(fakeEvent);
    };

  } catch (error) {
    console.error('[FCM] ❌ Error initializing push notifications:', error);
  }
}

export {
  initializePushNotifications,
  registerFCMToken,
  removeFCMToken,
  setupForegroundNotificationHandler,
  requestNotificationPermission,
  getFCMToken
};
