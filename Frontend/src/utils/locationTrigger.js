/**
 * Utility to trigger the Global Location Modal
 * This will show the LocationAccessModal if permission is not granted
 * OR if GPS is turned off on the device.
 */
export const triggerLocationPrompt = () => {
  window.dispatchEvent(new CustomEvent('requestLocationPrompt'));
};

/**
 * Higher level function to ensure location is working
 * and then execute a callback with the coordinates.
 */
export const withLocation = (callback) => {
  // 1. Setup a one-time listener for the result
  const handleUpdate = (e) => {
    window.removeEventListener('locationUpdate', handleUpdate);
    if (callback) callback(e.detail);
  };

  window.addEventListener('locationUpdate', handleUpdate);

  // 2. Trigger the check
  triggerLocationPrompt();
};

