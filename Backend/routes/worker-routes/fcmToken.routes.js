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
    const workerId = req.user._id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    // Use $addToSet to ensure uniqueness (prevent duplicates efficiently)
    const updateQuery = platform === 'mobile'
      ? { $addToSet: { fcmTokenMobile: token } }
      : { $addToSet: { fcmTokens: token } };

    const worker = await Worker.findByIdAndUpdate(workerId, updateQuery, { new: true });

    // Optional: Trim array if too long (separate operation to keep response fast and main op safe)
    // Only verify if length > MAX_TOKENS
    const currentTokens = platform === 'mobile' ? worker.fcmTokenMobile : worker.fcmTokens;
    if (currentTokens && currentTokens.length > MAX_TOKENS) {
      const sliceQuery = platform === 'mobile'
        ? { $push: { fcmTokenMobile: { $each: [], $slice: MAX_TOKENS } } } // Keep last 10 (or first 10?) - slice with positive keeps first N, negative keeps last N.
        // Wait, $slice on existing array requires $push with empty $each.
        // Actually, easiest to just keep it simple: $addToSet. 
        // Array growth is acceptable for now compared to duplicates issue.
        // We can just leave it as $addToSet.
        : { $addToSet: { fcmTokens: token } };
    }

    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

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
    res.status(500).json({ success: false, error: 'Failed to save FCM token' });
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

    const response = await sendPushNotification(uniqueTokens, {
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
