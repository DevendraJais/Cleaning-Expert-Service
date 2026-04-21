const Worker = require('../../models/Worker');
const { validationResult } = require('express-validator');
const cloudinaryService = require('../../services/cloudinaryService');

/**
 * Get worker profile
 */
const getProfile = async (req, res) => {
  try {
    const workerId = req.user.id;

    const worker = await Worker.findById(workerId).select('-password -__v');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        serviceCategories: worker.serviceCategories || [],
        serviceCategory: worker.serviceCategories?.[0] || '', // Legacy support
        skills: worker.skills || [],
        address: worker.address || null,
        rating: worker.rating || 0,
        totalJobs: worker.totalJobs || 0,
        completedJobs: worker.completedJobs || 0,
        status: worker.status,
        profilePhoto: worker.profilePhoto || null,
        settings: worker.settings || { notifications: true, language: 'en' },
        isPhoneVerified: worker.isPhoneVerified || false,
        isEmailVerified: worker.isEmailVerified || false,
        createdAt: worker.createdAt,
        updatedAt: worker.updatedAt
      }
    });
  } catch (error) {
    console.error('Get worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile. Please try again.'
    });
  }
};

/**
 * Update worker profile
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const workerId = req.user.id;
    const { name, serviceCategories, serviceCategory, skills, address, status, profilePhoto } = req.body;

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Update fields
    if (name) worker.name = name.trim();

    // Handle categories: prefer array, fallback to single legacy string
    if (serviceCategories && Array.isArray(serviceCategories)) {
      worker.serviceCategories = serviceCategories;
    } else if (serviceCategory) {
      worker.serviceCategories = [serviceCategory.trim()];
    }

    if (skills && Array.isArray(skills)) worker.skills = skills;
    if (address) {
      worker.address = {
        addressLine1: address.addressLine1 || worker.address?.addressLine1 || '',
        addressLine2: address.addressLine2 || worker.address?.addressLine2 || '',
        city: address.city || worker.address?.city || '',
        state: address.state || worker.address?.state || '',
        pincode: address.pincode || worker.address?.pincode || '',
        landmark: address.landmark || worker.address?.landmark || ''
      };
    }
    if (status) worker.status = status;
    // Update profile photo - upload to Cloudinary if it's a base64 string
    if (profilePhoto !== undefined) {
      if (profilePhoto && profilePhoto.startsWith('data:')) {
        const uploadRes = await cloudinaryService.uploadFile(profilePhoto, { folder: 'workers/profiles' });
        if (uploadRes.success) {
          worker.profilePhoto = uploadRes.url;
        }
      } else {
        worker.profilePhoto = profilePhoto;
      }
    }

    if (req.body.settings) {
      worker.settings = {
        notifications: req.body.settings.notifications !== undefined ? req.body.settings.notifications : (worker.settings?.notifications ?? true),
        soundAlerts: req.body.settings.soundAlerts !== undefined ? req.body.settings.soundAlerts : (worker.settings?.soundAlerts ?? true),
        language: req.body.settings.language || worker.settings?.language || 'en'
      };
    }

    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        serviceCategories: worker.serviceCategories,
        serviceCategory: worker.serviceCategories?.[0] || '',
        skills: worker.skills,
        address: worker.address,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        completedJobs: worker.completedJobs,
        status: worker.status,
        profilePhoto: worker.profilePhoto, // Include in response
        settings: worker.settings,
        isPhoneVerified: worker.isPhoneVerified,
        isEmailVerified: worker.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Update worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.'
    });
  }
};

/**
 * Update worker real-time location
 */
const updateLocation = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    // Update only the location field for performance
    await Worker.findByIdAndUpdate(workerId, {
      location: { lat, lng, updatedAt: new Date() }
    });

    res.status(200).json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateLocation
};

