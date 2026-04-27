const { createOrder, verifyPayment } = require('../../services/razorpayService');
const Worker = require('../../models/Worker');
const WorkerSubscriptionPlan = require('../../models/WorkerSubscriptionPlan');

/**
 * POST /api/workers/subscription/create-order
 * Create a Razorpay order for a subscription plan
 */
exports.createSubscriptionOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const workerId = req.user.id;
    console.log(`[SubscriptionPayment] Creating order for Plan: ${planId}, Worker: ${workerId}`);

    const plan = await WorkerSubscriptionPlan.findById(planId);
    if (!plan) {
      console.warn(`[SubscriptionPayment] Plan ${planId} not found`);
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    if (!plan.isActive) {
      console.warn(`[SubscriptionPayment] Plan ${planId} is inactive`);
      return res.status(400).json({ success: false, message: 'Plan is currently inactive' });
    }

    const worker = await Worker.findById(workerId).select('name phone');
    if (!worker) {
      console.warn(`[SubscriptionPayment] Worker ${workerId} not found`);
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    console.log(`[SubscriptionPayment] Fetching Razorpay order for amount: ${plan.price}`);

    // Create Razorpay order
    const orderResult = await createOrder(
      plan.price,
      'INR',
      `S_${workerId}_${Date.now().toString().slice(-6)}`, // Short receipt ID (max 40 chars)
      {
        workerId: workerId.toString(),
        planId: planId.toString(),
        planTitle: plan.title,
        type: 'worker_subscription'
      }
    );

    if (!orderResult.success) {
      console.error(`[SubscriptionPayment] Razorpay order failed:`, orderResult.error);
      return res.status(500).json({ success: false, message: orderResult.error || 'Failed to create payment order' });
    }

    console.log(`[SubscriptionPayment] ✅ Order created: ${orderResult.orderId}`);

    res.status(200).json({
      success: true,
      data: {
        orderId: orderResult.orderId,
        amount: orderResult.amount,
        currency: orderResult.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        planTitle: plan.title,
        durationDays: plan.durationDays,
        workerName: worker.name,
        workerPhone: worker.phone
      }
    });
  } catch (error) {
    console.error('[SubscriptionPayment] ❌ Create order crash:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

/**
 * POST /api/workers/subscription/verify-payment
 * Verify Razorpay payment and activate subscription
 */
exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    const workerId = req.user.id;

    // Verify payment signature
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Payment verification failed.' });
    }

    // Get plan details
    const plan = await WorkerSubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Get worker
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Calculate new expiry date
    const now = new Date();
    // If subscription still active → extend from current expiry
    // If expired or none → start from now
    const currentExpiry = worker.subscription?.expiryDate
      ? new Date(worker.subscription.expiryDate)
      : null;

    const baseDate = (currentExpiry && currentExpiry > now) ? currentExpiry : now;
    const expiryDate = new Date(baseDate);
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

    // Activate subscription
    worker.subscription = {
      isActive: true,
      planId: plan._id,
      planName: plan.title,
      startDate: now,
      expiryDate,
      durationDays: plan.durationDays,
      lastPaymentId: razorpay_payment_id,
      lastOrderId: razorpay_order_id
    };

    await worker.save();

    // --- RECORD TRANSACTION ---
    const Transaction = require('../../models/Transaction');
    await Transaction.create({
      workerId: worker._id,
      type: 'worker_subscription',
      amount: plan.price,
      status: 'completed',
      paymentMethod: 'razorpay',
      description: `Subscription: ${plan.title} (${plan.durationDays} days)`,
      referenceId: razorpay_payment_id,
      metadata: {
        orderId: razorpay_order_id,
        planId: plan._id,
        expiryDate: expiryDate
      }
    });

    // --- UPDATE PLATFORM EARNINGS ---
    const { recordWorkerSubscription } = require('../../services/earningTrackerService');
    await recordWorkerSubscription(now, plan.price);

    console.log(`[SubscriptionPayment] ✅ Worker ${workerId} subscribed to ${plan.title} until ${expiryDate}. Revenue recorded: ₹${plan.price}`);

    res.status(200).json({
      success: true,
      message: `🎉 Subscription activated! Valid until ${expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      data: {
        planName: plan.title,
        expiryDate,
        durationDays: plan.durationDays,
        paymentId: razorpay_payment_id
      }
    });
  } catch (error) {
    console.error('[SubscriptionPayment] Verify error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
