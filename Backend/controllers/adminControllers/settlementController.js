const Vendor = require('../../models/Vendor');
const Transaction = require('../../models/Transaction');
const Settlement = require('../../models/Settlement');
const Withdrawal = require('../../models/Withdrawal');
const mongoose = require('mongoose');
const { recordSettlement, recordWithdrawal } = require('../../services/earningTrackerService');

/**
 * Get all vendors with their wallet balances
 */
const getVendorBalances = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, filterDue } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let matchQuery = { approvalStatus: 'approved' };
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // If filtering by vendors who owe money
    if (filterDue === 'true') {
      matchQuery['wallet.dues'] = { $gt: 0 };
    }

    const vendors = await Vendor.find(matchQuery)
      .select('name businessName phone email wallet profilePhoto')
      .sort({ 'wallet.dues': -1 }) // Highest dues first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vendor.countDocuments(matchQuery);

    // Calculate total amount due to admin
    const totalDueResult = await Vendor.aggregate([
      { $match: { 'wallet.dues': { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$wallet.dues' } } }
    ]);

    const totalDueToAdmin = Math.abs(totalDueResult[0]?.total || 0);

    // Format vendor data
    const vendorData = vendors.map(v => ({
      _id: v._id,
      name: v.name,
      businessName: v.businessName,
      phone: v.phone,
      email: v.email,
      profilePhoto: v.profilePhoto,
      dues: v.wallet?.dues || 0,
      earnings: v.wallet?.earnings || 0,
      amountDue: v.wallet?.dues || 0,
      balance: (v.wallet?.earnings || 0) - (v.wallet?.dues || 0), // Net for reference
      totalCashCollected: v.wallet?.totalCashCollected || 0,
      cashLimit: v.wallet?.cashLimit || 10000,
      isBlocked: v.wallet?.isBlocked || false
    }));

    res.status(200).json({
      success: true,
      data: vendorData,
      summary: {
        totalDueToAdmin,
        vendorsWithDue: await Vendor.countDocuments({ 'wallet.dues': { $gt: 0 } })
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get vendor balances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor balances'
    });
  }
};

/**
 * Get specific vendor's ledger/transactions
 */
const getVendorLedger = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 50, type } = req.query;

    const vendor = await Vendor.findById(vendorId)
      .select('name businessName phone wallet');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const query = { vendorId: new mongoose.Types.ObjectId(vendorId) };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('bookingId', 'bookingNumber serviceName');

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        businessName: vendor.businessName,
        phone: vendor.phone,
        phone: vendor.phone,
        dues: vendor.wallet?.dues || 0,
        earnings: vendor.wallet?.earnings || 0,
        amountDue: vendor.wallet?.dues || 0
      },
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get vendor ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor ledger'
    });
  }
};

/**
 * Get all pending settlement requests
 */
const getPendingSettlements = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const settlements = await Settlement.find({ status: 'pending' })
      .populate('vendorId', 'name businessName phone profilePhoto wallet.balance')
      .sort({ createdAt: 1 }) // Oldest first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Settlement.countDocuments({ status: 'pending' });

    // Calculate total pending settlement amount
    const totalPending = await Settlement.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: settlements,
      summary: {
        totalPendingAmount: totalPending[0]?.total || 0,
        pendingCount: total
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get pending settlements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending settlements'
    });
  }
};

/**
 * Approve settlement request
 */
const approveSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user.id;

    const settlement = await Settlement.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found'
      });
    }

    if (settlement.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Settlement is not in pending status'
      });
    }

    const vendor = await Vendor.findById(settlement.vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const currentDues = vendor.wallet?.dues || 0;

    // Settlement reduces DUES
    // Ensure we don't go below zero (though validation handles request)
    vendor.wallet.dues = Math.max(0, currentDues - settlement.amount);

    // Auto-unblock if dues drop below limit
    if (vendor.wallet.isBlocked && vendor.wallet.dues <= (vendor.wallet.cashLimit || 10000)) {
      vendor.wallet.isBlocked = false;
      vendor.wallet.blockedAt = null;
      vendor.wallet.blockReason = null;
    }

    await vendor.save();

    // Update settlement
    settlement.status = 'approved';
    settlement.processedBy = adminId;
    settlement.processedAt = new Date();
    settlement.adminNotes = adminNotes;
    settlement.balanceAfter = vendor.wallet.dues;
    // Send Dues Payment (Settlement) Email
    const { sendDuesPaymentApprovedEmail } = require('../../services/emailService');
    sendDuesPaymentApprovedEmail(vendor, settlement.amount, vendor.wallet.dues).catch(e => console.error(e));

    await settlement.save();

    // Record this settlement in the earning tracker
    recordSettlement(new Date(), settlement.amount);

    res.status(200).json({
      success: true,
      message: 'Settlement approved successfully',
      data: {
        settlement,
        newDues: vendor.wallet.dues
      }
    });
  } catch (error) {
    console.error('Approve settlement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve settlement'
    });
  }
};

/**
 * Reject settlement request
 */
const rejectSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const settlement = await Settlement.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found'
      });
    }

    if (settlement.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Settlement is not in pending status'
      });
    }

    settlement.status = 'rejected';
    settlement.processedBy = adminId;
    settlement.processedAt = new Date();
    settlement.rejectionReason = rejectionReason;
    await settlement.save();

    res.status(200).json({
      success: true,
      message: 'Settlement rejected',
      data: settlement
    });
  } catch (error) {
    console.error('Reject settlement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject settlement'
    });
  }
};

/**
 * Get settlement history (all statuses)
 */
const getSettlementHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, vendorId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;

    const settlements = await Settlement.find(query)
      .populate('vendorId', 'name businessName phone')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Settlement.countDocuments(query);

    res.status(200).json({
      success: true,
      data: settlements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get settlement history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settlement history'
    });
  }
};

/**
 * Dashboard summary for admin
 */
const getSettlementDashboard = async (req, res) => {
  try {
    // Total amount due to admin
    // Total amount due to admin
    const totalDueResult = await Vendor.aggregate([
      { $match: { 'wallet.dues': { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$wallet.dues' } } }
    ]);
    const totalDueToAdmin = totalDueResult[0]?.total || 0;

    // Pending settlements
    const pendingSettlements = await Settlement.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Today's cash collections
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCollections = await Transaction.aggregate([
      {
        $match: {
          type: 'cash_collected',
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // This week settlements
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekSettlements = await Transaction.aggregate([
      {
        $match: {
          type: 'settlement',
          status: 'completed',
          createdAt: { $gte: weekStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDueToAdmin,
        vendorsWithDue: await Vendor.countDocuments({ 'wallet.dues': { $gt: 0 } }),
        pendingSettlements: {
          amount: pendingSettlements[0]?.total || 0,
          count: pendingSettlements[0]?.count || 0
        },
        todayCashCollected: {
          amount: todayCollections[0]?.total || 0,
          count: todayCollections[0]?.count || 0
        },
        weeklySettlements: {
          amount: weekSettlements[0]?.total || 0,
          count: weekSettlements[0]?.count || 0
        }
      }
    });
  } catch (error) {
    console.error('Get settlement dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

/**
 * Block Vendor (Manual or auto-triggered)
 */
const blockVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    vendor.wallet.isBlocked = true;
    vendor.wallet.blockedAt = new Date();
    vendor.wallet.blockReason = reason || 'Blocked by admin due to pending dues.';
    await vendor.save();

    res.status(200).json({ success: true, message: 'Vendor blocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Unblock Vendor
 */
const unblockVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    vendor.wallet.isBlocked = false;
    vendor.wallet.blockedAt = null;
    vendor.wallet.blockReason = null;
    await vendor.save();

    res.status(200).json({ success: true, message: 'Vendor unblocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Vendor Cash Limit
 */
const updateCashLimit = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { limit } = req.body;

    if (!limit || limit < 0) {
      return res.status(400).json({ success: false, message: 'Invalid limit' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    vendor.wallet.cashLimit = limit;

    // Auto unblock if new limit covers dues
    if (vendor.wallet.isBlocked && (vendor.wallet.dues || 0) <= limit) {
      vendor.wallet.isBlocked = false;
      vendor.wallet.blockedAt = null;
      vendor.wallet.blockReason = null;
    }

    await vendor.save();

    res.status(200).json({ success: true, message: 'Cash limit updated successfully', limit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVendorBalances,
  getVendorLedger,
  getPendingSettlements,
  approveSettlement,
  rejectSettlement,
  getSettlementHistory,
  getSettlementDashboard,
  blockVendor,
  unblockVendor,
  updateCashLimit,

  // Withdrawal functions
  getWithdrawalRequests: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const withdrawals = await Withdrawal.find({ status: 'pending' })
        .populate('vendorId', 'name businessName phone wallet.earnings')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Withdrawal.countDocuments({ status: 'pending' });

      res.status(200).json({
        success: true,
        data: withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  approveWithdrawal: async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      const { transactionReference, notes } = req.body;
      const adminId = req.user.id;

      // Fetch global settings for rates
      const Settings = require('../../models/Settings');
      const settings = await Settings.findOne({ type: 'global' });
      const tdsRate = settings?.tdsPercentage || 1;
      const platformFeeRate = settings?.platformFeePercentage || 1;

      const withdrawal = await Withdrawal.findById(withdrawalId);
      if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' });
      if (withdrawal.status !== 'pending') return res.status(400).json({ success: false, message: 'Not pending' });

      const vendor = await Vendor.findById(withdrawal.vendorId);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

      if (vendor.wallet.earnings < withdrawal.amount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient earnings. Available: ₹${vendor.wallet.earnings}`
        });
      }

      // Calculate Deductions
      const grossAmount = withdrawal.amount;
      const tdsAmount = Math.round((grossAmount * tdsRate) / 100);
      const platformFeeAmount = Math.round((grossAmount * platformFeeRate) / 100);
      const netAmount = grossAmount - tdsAmount - platformFeeAmount;

      // Deduct full amount from vendor earnings (gross)
      vendor.wallet.earnings -= grossAmount;
      vendor.wallet.totalWithdrawn = (vendor.wallet.totalWithdrawn || 0) + grossAmount;
      await vendor.save();

      // Update withdrawal with details
      withdrawal.status = 'approved';
      withdrawal.processedBy = adminId;
      withdrawal.processedDate = new Date();
      withdrawal.transactionReference = transactionReference;
      withdrawal.adminNotes = notes;
      withdrawal.tdsRate = tdsRate;
      withdrawal.tdsAmount = tdsAmount;
      withdrawal.platformFeeRate = platformFeeRate;
      withdrawal.platformFeeAmount = platformFeeAmount;
      withdrawal.netAmount = netAmount;
      await withdrawal.save();

      // Record withdrawal payout in earning tracker
      // We pass the amount that legitimately left platform bounds to Vendor (including TDS tracking separately later if needed)
      recordWithdrawal(new Date(), grossAmount);

      // Send Withdrawal Approved Email
      const { sendWithdrawalApprovedEmail } = require('../../services/emailService');
      sendWithdrawalApprovedEmail(vendor, grossAmount, transactionReference).catch(e => console.error(e));

      // Transaction 1: Withdrawal Payout (Gross Amount Debited from Wallet)
      await Transaction.create({
        vendorId: vendor._id,
        type: 'withdrawal',
        amount: grossAmount,
        status: 'completed',
        paymentMethod: 'bank_transfer',
        description: `Withdrawal payout processed. Gross: ₹${grossAmount}`,
        referenceId: transactionReference,
        metadata: {
          withdrawalId: withdrawal._id,
          tdsRate,
          tdsAmount,
          platformFeeRate,
          platformFeeAmount,
          netAmount
        }
      });

      // Transaction 2: TDS Deduction
      await Transaction.create({
        vendorId: vendor._id,
        type: 'tds_deduction',
        amount: tdsAmount,
        status: 'completed',
        paymentMethod: 'system',
        description: `TDS Deduction (${tdsRate}%) on withdrawal of ₹${grossAmount}`,
        referenceId: transactionReference,
        metadata: {
          withdrawalId: withdrawal._id,
          grossAmount,
          tdsRate,
          netAmountTransferred: netAmount
        }
      });

      // Transaction 3: Platform Fee Deduction
      await Transaction.create({
        vendorId: vendor._id,
        type: 'platform_fee',
        amount: platformFeeAmount,
        status: 'completed',
        paymentMethod: 'system',
        description: `Platform Charge Fee (${platformFeeRate}%) on withdrawal of ₹${grossAmount}`,
        referenceId: transactionReference,
        metadata: {
          withdrawalId: withdrawal._id,
          grossAmount,
          platformFeeRate,
          netAmountTransferred: netAmount
        }
      });

      res.status(200).json({
        success: true,
        message: 'Withdrawal approved with deductions',
        data: {
          grossAmount,
          tdsRate,
          tdsAmount,
          platformFeeRate,
          platformFeeAmount,
          netAmount,
          transactionReference
        }
      });
    } catch (error) {
      console.error('Approve withdrawal error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },


  rejectWithdrawal: async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const withdrawal = await Withdrawal.findById(withdrawalId);
      if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' });

      withdrawal.status = 'rejected';
      withdrawal.processedBy = adminId;
      withdrawal.processedAt = new Date();
      withdrawal.rejectionReason = reason;
      await withdrawal.save();



      res.status(200).json({ success: true, message: 'Withdrawal rejected' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
