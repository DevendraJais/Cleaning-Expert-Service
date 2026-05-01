/**
 * Firebase Messaging Service Worker
 * Handles background push notifications with sound alerts
 * Version: 1.0.5
 */


// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration - Production values
const firebaseConfig = {
  apiKey: 'AIzaSyCbz4QqWm_o2rRxGEGDN3n4kGCjmCnWWdY',
  authDomain: 'truliq.firebaseapp.com',
  projectId: 'truliq',
  storageBucket: 'truliq.firebasestorage.app',
  messagingSenderId: '268401383377',
  appId: '1:268401383377:web:ccd98bba66f06603f332f0',
  measurementId: 'G-51TK8SKZFS'
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Notification sounds based on type
const NOTIFICATION_SOUNDS = {
  new_booking: '/booking-alert.mp3',
  booking_accepted: '/success.mp3',
  worker_assigned: '/notification.mp3',
  job_assigned: '/booking-alert.mp3',
  booking_completed: '/success.mp3',
  default: '/notification.mp3'
};

// To prevent duplicate displays in background (SOP Section 7, Step 3)
const shownNotifications = new Set();

// ✅ CORRECT APPROACH per SOP:
// - payload.notification → used for system notification (background/closed tab)
// - payload.data → used for relay to foreground tabs
messaging.onBackgroundMessage(async (payload) => {
  console.log('[SW] 🔔 Firebase onBackgroundMessage received:', payload);

  const data = payload.data || {};
  const notification = payload.notification || {}; // ✅ from backend notification field
  const notificationId = data.notificationId;

  // 🚫 Prevent duplicate display
  if (notificationId && shownNotifications.has(notificationId)) {
    console.log('[SW] 🚫 Deduplicated message:', notificationId);
    return;
  }
  if (notificationId) {
    shownNotifications.add(notificationId);
    setTimeout(() => shownNotifications.delete(notificationId), 60000);
  }

  // ✅ STEP 1: Relay to ALL open clients (handles foreground toast)
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  console.log(`[SW] 📤 Relaying to ${clients.length} open client(s)`);
  clients.forEach((client) => {
    client.postMessage({ type: 'FCM_FOREGROUND_MESSAGE', payload: data });
  });

  const notificationType = data.type || 'default';

  // ✅ STEP 2: Build title/body for system notification
  // Use payload.notification first (sent by backend), fall back to data fields
  let notificationTitle = notification.title || data.title || 'App Notification';
  let notificationBody = notification.body || data.body || 'You have a new update.';

  if (!notificationTitle && !notificationBody) {
    console.log('[SW] 🚫 Skipping empty notification');
    return;
  }

  let icon = data.icon || notification.icon || '/truliq-logo.png';
  let badge = '/truliq-logo.png';
  let tag = data.bookingId || `notification-${Date.now()}`;
  let requireInteraction = false;
  let vibrate = [200, 100, 200];
  let actions = [];


  // Enhanced styling for different notification types
  switch (notificationType) {
    case 'booking_requested':
      notificationTitle = notificationTitle || '📅 Booking Created!';
      notificationBody = notificationBody || 'Your service request has been received.';
      vibrate = [200, 100];
      actions = [
        { action: 'view', title: '👁️ View Status' }
      ];
      break;

    case 'new_booking':
      notificationTitle = data.title || notification.title || '🔔 New Booking Request!';
      notificationBody = data.body || notification.body || 'You have a new service request.';
      requireInteraction = true;
      vibrate = [500, 200, 500, 200, 500];
      actions = [
        { action: 'accept', title: '✓ Accept', icon: '/icons/accept.png' },
        { action: 'reject', title: '✗ Decline', icon: '/icons/reject.png' }
      ];
      break;

    case 'job_assigned':
      // Worker job assignment - urgent
      notificationTitle = data.title || notification.title || '🔔 New Job Assigned!';
      notificationBody = data.body || notification.body || 'You have been assigned a new job.';
      requireInteraction = true;
      vibrate = [500, 200, 500, 200, 500];
      actions = [
        { action: 'accept', title: '✓ Accept Job', icon: '/icons/accept.png' },
        { action: 'view', title: '👁️ View Details' }
      ];
      break;

    case 'booking_accepted':
    case 'worker_accepted':
      notificationTitle = data.title || notification.title || '✅ Professional Confirmed!';
      notificationBody = data.body || notification.body || 'A professional has accepted your booking.';
      vibrate = [200, 100, 200];
      actions = [
        { action: 'view', title: '👁️ View Booking' }
      ];
      break;

    case 'job_accepted':
      notificationTitle = data.title || notification.title || '✅ Job Confirmed!';
      notificationBody = data.body || notification.body || 'You have successfully accepted the job.';
      vibrate = [200, 100, 200];
      actions = [
        { action: 'view', title: '👁️ View Job' }
      ];
      break;

    case 'visit_verified':
      notificationTitle = data.title || notification.title || '📍 Visit Verified';
      notificationBody = data.body || notification.body || 'The professional has arrived and verified the visit.';
      vibrate = [200, 100, 200];
      break;

    case 'work_completed':
    case 'work_done':
    case 'worker_completed':
      notificationTitle = data.title || notification.title || '✅ Work Finished!';
      notificationBody = data.body || notification.body || 'Professional has finished the work. Please verify and pay.';
      requireInteraction = true;
      vibrate = [200, 100, 200, 100, 200];
      actions = [
        { action: 'view', title: '👁️ View Summary' }
      ];
      break;

    case 'earnings_credited':
    case 'payment_received':
      notificationTitle = data.title || notification.title || '💰 Payment Received!';
      notificationBody = data.body || notification.body || 'Payment has been successfully processed.';
      vibrate = [200, 500, 200];
      break;

    case 'worker_assigned':
      notificationTitle = data.title || notification.title || '👷 Worker Assigned';
      notificationBody = data.body || notification.body || 'A professional has been assigned to your booking.';
      vibrate = [200, 100, 200];
      actions = [
        { action: 'track', title: '📍 Track Worker' }
      ];
      break;

    case 'journey_started':
    case 'worker_started':
      notificationTitle = data.title || notification.title || '📍 Professional is on the way!';
      notificationBody = data.body || notification.body || 'Your service provider has started their journey.';
      requireInteraction = true;
      vibrate = [500, 200, 500];
      actions = [
        { action: 'track', title: '📍 Track Arrival', icon: '/icons/track.png' }
      ];
      break;

    case 'work_done':
    case 'worker_completed':
      notificationTitle = data.title || notification.title || '✅ Work Finished!';
      notificationBody = data.body || notification.body || 'Professional has finished the work and is preparing the bill.';
      requireInteraction = true;
      vibrate = [200, 100, 200, 100, 200];
      actions = [
        { action: 'view', title: '👁️ View Summary' }
      ];
      break;

    case 'booking_completed':
      notificationTitle = data.title || notification.title || '🎉 Booking Completed!';
      notificationBody = data.body || notification.body || 'Service has been completed successfully.';
      vibrate = [200, 100, 200, 100, 200];
      actions = [
        { action: 'rate', title: '⭐ Rate Now' }
      ];
      break;
  }

  const notificationOptions = {
    body: notificationBody,
    icon: icon,
    badge: badge,
    tag: tag,
    sound: NOTIFICATION_SOUNDS[notificationType] || NOTIFICATION_SOUNDS.default,
    data: {
      ...data,
      notificationType: notificationType,
      url: data.link || '/',
      timestamp: Date.now()
    },
    // Vibration pattern for mobile devices
    vibrate: vibrate,
    // Keep notification until user interacts (for important ones)
    requireInteraction: requireInteraction,
    // Action buttons
    actions: actions,
    // Sound will be played by the system for high priority
    silent: false,
    // Renotify even if same tag exists
    renotify: true,
    // Timestamp
    timestamp: Date.now()
  };

  // Show the notification ONLY if app is not in foreground (to avoid duplicate with in-app socket toast)
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function (clientList) {
      const isVisible = clientList.some(function (client) {
        return client.visibilityState === 'visible';
      });

      // Re-enabled system notifications even if visible to ensure user sees them
      /*
      if (isVisible) {
        console.log('[SW] 🚫 App is visible, skipping system notification to avoid duplicate');
        return;
      }
      */


      return self.registration.showNotification(notificationTitle, notificationOptions);
    })
    .catch(function (err) {
      console.error('[SW] ⚠️ Error checking clients, falling back to notification:', err);
      return self.registration.showNotification(notificationTitle, notificationOptions);
    });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 📱 Notification clicked:', event.action, event.notification.data);

  const notification = event.notification;
  const data = notification.data || {};
  const action = event.action;

  // Close the notification
  notification.close();

  let urlToOpen = data.url || data.link || '/';

  // Handle different actions
  switch (action) {
    case 'accept':
      // Accept booking/job - navigate to details page
      if (data.bookingId) {
        if (data.notificationType === 'job_assigned') {
          urlToOpen = `/worker/job/${data.bookingId}`;
        } else {
          urlToOpen = `/vendor/bookings/${data.bookingId}`;
        }
      }
      break;

    case 'reject':
    case 'decline':
      // User rejected - just close notification
      return;

    case 'view':
    case 'track':
      // View details
      if (data.bookingId) {
        urlToOpen = data.link || `/user/booking/${data.bookingId}`;
      }
      break;

    case 'rate':
      // Navigate to rating page
      if (data.bookingId) {
        urlToOpen = `/user/booking/${data.bookingId}?rate=true`;
      }
      break;

    default:
      // Default click - open the link
      urlToOpen = data.link || data.url || '/';
  }

  // Ensure URL is absolute
  const origin = self.location.origin;
  if (urlToOpen && !urlToOpen.startsWith('http')) {
    urlToOpen = new URL(urlToOpen, origin).href;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          // Navigate to the specific URL
          if (urlToOpen) {
            return client.navigate(urlToOpen);
          }
          return;
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] ❌ Notification closed:', event.notification.data);
});

// Note: Raw push events are handled by Firebase SDK internally.
// We relay messages to foreground clients via onBackgroundMessage above.

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] 📦 Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] ✅ Service Worker activated');
  event.waitUntil(clients.claim());
});

console.log('[SW] 🚀 Firebase Messaging Service Worker loaded');
