const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { WORKER_STATUS } = require('../utils/constants');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls
    trim: true,
    lowercase: true,
    default: null
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['worker'],
    default: 'worker'
  },
  password: {
    type: String,
    select: false
  },
  aadhar: {
    number: {
      type: String,
      trim: true
    },
    document: {
      type: String, // Cloudinary URL (Front)
    },
    backDocument: {
      type: String, // Cloudinary URL (Back)
    }
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  serviceCategories: [{
    type: String
  }],
  status: {
    type: String,
    enum: Object.values(WORKER_STATUS),
    default: WORKER_STATUS.OFFLINE
  },
  profilePhoto: {
    type: String,
    default: null
  },
  address: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  rating: {
    type: Number,
    default: 0
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Wallet
  wallet: {
    balance: {
      type: Number,
      default: 0
    }
  },
  // Settings
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    soundAlerts: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  // Real-time Location
  location: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  // Additional Stats
  cancelledJobs: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },

  // FCM Push Notification Tokens
  fcmTokens: {
    type: [String],
    default: []
  },
  fcmTokenMobile: {
    type: [String],
    default: []
  },
  loginSessionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
workerSchema.index({ status: 1 });
workerSchema.index({ serviceCategories: 1 });
workerSchema.index({ vendorId: 1 });

// Hash password before saving
workerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
workerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Worker', workerSchema);

