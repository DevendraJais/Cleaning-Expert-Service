/**
 * Worker FCM Token Routes
 * Manages FCM tokens for push notifications
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { sendPushNotification } = require('../../services/firebaseAdmin');
const Worker = require('../../models/Worker');
const User = require('../../models/User');
const Vendor = require('../../models/Vendor');

const MAX_TOKENS = 10; // Maximum tokens per platform

/**
 * @route   POST /api/workers/fcm-tokens/save
 * @desc    Save FCM token for worker
 * @access  Private (Worker)
 */
router.post('/save', authenticate, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const workerId = req.user._id || req.user.id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    // Find the worker
    const worker = await Worker.findById(workerId);

    if (!worker) {
      console.error(`[FCM] Worker not found for ID: ${workerId}`);
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    // Update tokens based on platform
    if (platform === 'mobile') {
      if (!worker.fcmTokenMobile) worker.fcmTokenMobile = [];
      if (!worker.fcmTokenMobile.includes(token)) {
        worker.fcmTokenMobile.push(token);
      }
    } else {
      if (!worker.fcmTokens) worker.fcmTokens = [];
      if (!worker.fcmTokens.includes(token)) {
        worker.fcmTokens.push(token);
      }
    }

    // Save with validation
    await worker.save();
    console.log(`[FCM] ✅ Token saved for worker: ${workerId} (${platform})`);

    // Remove this token from User and Vendor collections to prevent cross-account notifications
    // COMMENTED OUT to allow testing on same device
    /*
    try {
      await User.updateMany(
        { $or: [{ fcmTokens: token }, { fcmTokenMobile: token }] },
        { $pull: { fcmTokens: token, fcmTokenMobile: token } }
      );

      await Vendor.updateMany(
        { $or: [{ fcmTokens: token }, { fcmTokenMobile: token }] },
        { $pull: { fcmTokens: token, fcmTokenMobile: token } }
      );
    } catch (cleanupError) {
      console.error('Error removing token from other collections:', cleanupError);
    }
    */

    res.json({ success: true, message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save FCM token',
      details: error.message 
    });
  }
});

/**
 * @route   DELETE /api/workers/fcm-tokens/remove
 * @desc    Remove FCM token for worker
 * @access  Private (Worker)
 */
router.delete('/remove', authenticate, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const workerId = req.user._id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    // Remove token based on platform
    if (platform === 'web' && worker.fcmTokens) {
      worker.fcmTokens = worker.fcmTokens.filter(t => t !== token);
    } else if (platform === 'mobile' && worker.fcmTokenMobile) {
      worker.fcmTokenMobile = worker.fcmTokenMobile.filter(t => t !== token);
    }

    await worker.save();

    res.json({ success: true, message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to remove FCM token' });
  }
});

/**
 * @route   DELETE /api/workers/fcm-tokens/remove-all
 * @desc    Remove ALL FCM tokens for a specific platform (called during logout)
 * @access  Private (Worker)
 */
router.delete('/remove-all', authenticate, async (req, res) => {
  try {
    const workerId = req.user._id;
    const { platform = 'web' } = req.body;

    // Clear only the specified platform's tokens
    const updateQuery = platform === 'mobile'
      ? { $set: { fcmTokenMobile: [] } }
      : { $set: { fcmTokens: [] } };

    const worker = await Worker.findByIdAndUpdate(workerId, updateQuery, { new: true });

    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    console.log(`[FCM] ✅ All ${platform} tokens removed for worker: ${workerId}`);
    res.json({ success: true, message: `All ${platform} FCM tokens removed successfully` });
  } catch (error) {
    console.error('Error removing FCM tokens:', error);
    res.status(500).json({ success: false, error: 'Failed to remove FCM tokens' });
  }
});

/**
 * @route   POST /api/workers/fcm-tokens/test
 * @desc    Send test notification to worker (development only)
 * @access  Private (Worker)
 */
router.post('/test', authenticate, async (req, res) => {
  try {
    const workerId = req.user._id;
    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    const tokens = [...(worker.fcmTokens || []), ...(worker.fcmTokenMobile || [])];
    const uniqueTokens = [...new Set(tokens)];

    if (uniqueTokens.length === 0) {
      return res.json({ success: false, error: 'No FCM tokens found for worker' });
    }

    const response = await sendPushNotification(worker, {
      notificationId: 'test-notification',
      title: '🔔 Test Notification',
      body: 'This is a test notification for worker!',
      data: {
        type: 'test',
        link: '/worker/dashboard'
      }
    });

    res.json({
      success: true,
      message: 'Test notification sent',
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
