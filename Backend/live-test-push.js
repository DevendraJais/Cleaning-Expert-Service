require('dotenv').config();
const mongoose = require('mongoose');
const { sendPushNotification } = require('./services/firebaseAdmin');
const Worker = require('./models/Worker');

async function testWorkerPush() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const workerId = '69f1a5877c45e32ebaef18e8'; // Worker ID from your logs
    const worker = await Worker.findById(workerId);

    if (!worker) {
      console.log('❌ Worker not found');
      return;
    }

    console.log(`📡 Sending test push to Worker: ${worker.name}`);
    console.log(`📱 Tokens found: ${worker.fcmTokens?.length || 0} (Web), ${worker.fcmTokenMobile?.length || 0} (Mobile)`);

    if (!worker.fcmTokens?.length && !worker.fcmTokenMobile?.length) {
      console.log('❌ No tokens found for this worker');
      return;
    }

    const payload = {
      title: 'Truliq Test Alert 🚀',
      body: 'If you see this, your push notifications are WORKING!',
      data: {
        type: 'test-push',
        notificationId: 'test-notification' // Bypass dedupe for testing
      }
    };

    const result = await sendPushNotification(worker, payload);
    console.log('✅ Push Result:', result);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error in test script:', error);
    process.exit(1);
  }
}

testWorkerPush();
