import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSave, FiUser, FiPhone, FiMail,
  FiMapPin, FiBriefcase, FiCamera, FiCheck,
  FiChevronDown, FiX
} from 'react-icons/fi';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import workerService from '../../../../services/workerService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';
import AddressSelectionModal from '../../../user/pages/Checkout/components/AddressSelectionModal';
import { z } from "zod";

// Zod schema
import flutterBridge from '../../../../utils/flutterBridge';

const workerProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(), // Read-only but good to have in schema
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  serviceCategories: z.array(z.string()).min(1, "Select at least one category"),
  address: z.object({
    addressLine1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    fullAddress: z.string().optional()
  }).refine((data) => {
    return (data.fullAddress && data.fullAddress.length > 5) || (data.addressLine1 && data.addressLine1.length > 0);
  }, { message: "Address is required" })
});

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      addressLine1: '',
      city: '',
      state: '',
      pincode: '',
    },
    serviceCategories: [],
    profilePhoto: null,
    status: 'OFFLINE'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const handleNativeCamera = async () => {
    const file = await flutterBridge.openCamera();
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      flutterBridge.hapticFeedback('success');
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [profileRes, catalogRes] = await Promise.all([
          workerService.getProfile(),
          publicCatalogService.getCategories()
        ]);

        if (profileRes.success) {
          const w = profileRes.worker;
          setFormData({
            name: w.name || '',
            phone: w.phone || '',
            email: w.email || '',
            address: {
              addressLine1: w.address?.addressLine1 || '',
              city: w.address?.city || '',
              state: w.address?.state || '',
              pincode: w.address?.pincode || '',
            },
            serviceCategories: w.serviceCategories || (w.serviceCategory ? [w.serviceCategory] : []),
            profilePhoto: w.profilePhoto || null,
            status: w.status || 'OFFLINE'
          });
        }

        if (catalogRes.success) {
          setCategories(catalogRes.categories || []);
        }
      } catch (error) {
        console.error('Init error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    let baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    if (!baseUrl) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        baseUrl = 'http://localhost:5000';
      } else {
        baseUrl = window.location.origin;
      }
    }
    baseUrl = baseUrl.replace(/\/api$/, '');
    const response = await fetch(`${baseUrl}/api/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Upload failed');
    return data.imageUrl;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCategoryChange = (val) => {
    setFormData(prev => {
      const current = prev.serviceCategories || [];
      const updated = current.includes(val)
        ? current.filter(c => c !== val)
        : [...current, val];

      return {
        ...prev,
        serviceCategories: updated
      };
    });
  };


  const handleAddressSave = (houseNumber, location) => {
    // Extract components from Google Maps location
    let city = '';
    let state = '';
    let pincode = '';
    let addressLine2 = '';

    if (location.components) {
      location.components.forEach(comp => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
        if (comp.types.includes('postal_code')) pincode = comp.long_name;
        if (comp.types.includes('sublocality')) addressLine2 = comp.long_name;
      });
    }

    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        addressLine1: houseNumber || prev.address.addressLine1,
        addressLine2: addressLine2,
        city: city || prev.address.city,
        state: state || prev.address.state,
        pincode: pincode || prev.address.pincode,
        fullAddress: location.address // Store the full formatted address string
      }
    }));
    setIsAddressModalOpen(false);
  };

  const handleSubmit = async () => {
    // Zod Validation
    const validationResult = workerProfileSchema.safeParse({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      serviceCategories: formData.serviceCategories,
      address: formData.address
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues?.[0]?.message || "Validation failed";
      toast.error(errorMessage);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        serviceCategories: formData.serviceCategories,
        serviceCategory: formData.serviceCategories[0], // Fallback
        address: formData.address,
        status: formData.status
      };

      if (photoFile) {
        try {
          const photoUrl = await uploadFile(photoFile);
          payload.profilePhoto = photoUrl;
        } catch (uploadErr) {
          console.error('Photo upload failed', uploadErr);
          toast.error('Failed to upload photo');
          setSaving(false);
          return;
        }
      }

      await workerService.updateProfile(payload);
      toast.success('Profile updated successfully');

      // Update local storage to keep session in sync if needed
      const currentWorker = JSON.parse(localStorage.getItem('workerData') || '{}');
      localStorage.setItem('workerData', JSON.stringify({
        ...currentWorker,
        ...payload,
        profilePhoto: payload.profilePhoto || currentWorker.profilePhoto
      }));

      navigate('/worker/profile');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Edit Profile" />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center cursor-pointer"
              onClick={() => flutterBridge.isFlutter ? handleNativeCamera() : document.getElementById('photo-upload').click()}
            >
              {photoPreview || formData.profilePhoto ? (
                <img src={photoPreview || formData.profilePhoto} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                  <FiUser className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
            {/* Camera Icon */}
            <div
              className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white ring-2 ring-white shadow-sm cursor-pointer"
              onClick={() => flutterBridge.isFlutter ? handleNativeCamera() : document.getElementById('photo-upload').click()}
            >
              <FiCamera className="w-4 h-4" />
            </div>
            {!flutterBridge.isFlutter && (
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">Tap to change photo</p>
        </div>

        {/* Availability Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiCheck className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Availability</h2>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleInputChange('status', 'ONLINE')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${formData.status === 'ONLINE'
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-200 text-gray-500'
                }`}
            >
              Online
            </button>
            <button
              onClick={() => handleInputChange('status', 'OFFLINE')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${formData.status === 'OFFLINE'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-white border-gray-200 text-gray-500'
                }`}
            >
              Offline
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Set your status to receive new job assignments.
          </p>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiUser className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Personal Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block ml-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="Enter name"
              />
              {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block ml-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block ml-1">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.phone}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                  VERIFIED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiMapPin className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Address Details</h2>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-700">
                {formData.address?.fullAddress ||
                  `${formData.address?.addressLine1 || ''} ${formData.address?.city || ''} ${formData.address?.state || ''} ${formData.address?.pincode || ''}`
                }
              </p>
              {!formData.address?.fullAddress && !formData.address?.addressLine1 && (
                <p className="text-xs text-gray-400 italic mt-1">No address set</p>
              )}
            </div>

            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <FiMapPin className="w-4 h-4" />
              Build/Change Location on Map
            </button>
          </div>
        </div>

        {/* Work Category */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiBriefcase className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Work Profile</h2>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">
              Categories
            </label>
            <div className="relative">
              <div
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-wrap gap-2">
                  {formData.serviceCategories && formData.serviceCategories.length > 0 ? (
                    formData.serviceCategories.map((cat, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Select Categories</span>
                  )}
                </div>
                <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </div>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
                  {categories.map((cat, index) => {
                    const isSelected = formData.serviceCategories.includes(cat.title);
                    return (
                      <div
                        key={cat._id || index}
                        onClick={() => {
                          handleCategoryChange(cat.title);
                          // Don't close immediately for multi-select
                        }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 font-medium text-gray-700 flex justify-between items-center"
                      >
                        <span>{cat.title}</span>
                        {isSelected && <FiCheck className="text-blue-600 w-4 h-4" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {errors.serviceCategories && <p className="text-red-500 text-[10px] mt-1">{errors.serviceCategories}</p>}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/worker/profile')}
            className="w-full py-3.5 bg-white text-gray-500 border border-gray-200 rounded-2xl font-bold text-sm uppercase tracking-wider active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>

      </main>



      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={formData.address?.fullAddress || ''} // Passing for initial view if supported later
        houseNumber={formData.address?.addressLine1 || ''}
        onHouseNumberChange={(val) => handleInputChange('address.addressLine1', val)}
        onSave={handleAddressSave}
      />

      <BottomNav />
    </div >
  );
};

export default EditProfile;

