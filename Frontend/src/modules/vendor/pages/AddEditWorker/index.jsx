import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiLink, FiUserPlus, FiSearch, FiChevronDown, FiCamera, FiUpload, FiMapPin } from 'react-icons/fi';
import AddressSelectionModal from '../../../user/pages/Checkout/components/AddressSelectionModal';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { createWorker, updateWorker, getWorkerById, linkWorker } from '../../services/workerService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';
import { z } from "zod";

// Zod schemas
const addWorkerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter valid 10-digit phone number"),
  serviceCategories: z.array(z.string()).min(1, "Select at least one category"),
  aadhar: z.object({
    number: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits"),
    // document: z.any() 
  }),
  // address: z.any().optional() // Make address optional or strict as needed
});

const editWorkerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter valid 10-digit phone number"),
  serviceCategories: z.array(z.string()).min(1, "Select at least one category"),
});

const AddEditWorker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'link'
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    aadhar: {
      number: '',
      document: '' // Base64 string ideally
    },
    serviceCategories: [],
    address: {
      addressLine1: '',
      city: '',
      state: '',
      pincode: ''
    },
    status: 'active',
    profilePhoto: '', // URL
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [linkPhone, setLinkPhone] = useState('');

  const [errors, setErrors] = useState({});

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        const catRes = await publicCatalogService.getCategories();
        if (catRes.success) {
          console.log('Loaded Categories:', catRes.categories || []);
          setCategories(catRes.categories || []);
        }

        if (isEdit) {
          setLoading(true);
          const res = await getWorkerById(id);
          if (res.success) {
            const w = res.data;
            setFormData({
              name: w.name || '',
              phone: w.phone || '',
              email: w.email || '',
              aadhar: {
                number: w.aadhar?.number || '',
                document: w.aadhar?.document || ''
              },
              serviceCategories: w.serviceCategories || (w.serviceCategory ? [w.serviceCategory] : []),
              address: {
                addressLine1: w.address?.addressLine1 || '',
                city: w.address?.city || '',
                state: w.address?.state || '',
                pincode: w.address?.pincode || ''
              },
              status: w.status || 'active',
              profilePhoto: w.profilePhoto || ''
            });

            if (w.profilePhoto) {
              setPhotoPreview(w.profilePhoto);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Init error:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };
    initData();
  }, [id, isEdit]);

  // Upload file helper
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

  const handleAadharChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setAadharFile(file);
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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const toggleCategory = (val) => {
    setFormData(prev => {
      const serviceCategories = prev.serviceCategories.includes(val)
        ? prev.serviceCategories.filter(c => c !== val)
        : [...prev.serviceCategories, val];

      return {
        ...prev,
        serviceCategories
      };
    });
  };

  const handleAddressSave = (houseNumber, location) => {
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
        addressLine1: houseNumber,
        addressLine2: addressLine2,
        city: city,
        state: state,
        pincode: pincode,
        fullAddress: location.address
      }
    }));
    setIsAddressModalOpen(false);
  };

  // toggleSkill removed


  const handleSubmit = async () => {
    // Zod Validation depending on mode
    const schema = isEdit ? editWorkerSchema : addWorkerSchema;

    // Construct validation object
    const validationData = {
      name: formData.name,
      phone: formData.phone,
      serviceCategories: formData.serviceCategories,
      ...(isEdit ? {} : { aadhar: { number: formData.aadhar.number } })
    };

    const validationResult = schema.safeParse(validationData);

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    // Additional manual check for Aadhar doc on 'new'
    if (!isEdit && !formData.aadhar.document && !aadharFile) {
      toast.error("Aadhar document is required");
      return;
    }

    try {
      setLoading(true);
      setUploading(true);

      let photoUrl = formData.profilePhoto;
      let aadharUrl = formData.aadhar.document;

      // Upload photo if selected
      if (photoFile) {
        try {
          photoUrl = await uploadFile(photoFile);
        } catch (err) {
          console.error('Photo upload failed:', err);
          toast.error('Failed to upload profile photo');
          setLoading(false);
          setUploading(false);
          return;
        }
      }

      // Upload Aadhar if selected
      if (aadharFile) {
        try {
          aadharUrl = await uploadFile(aadharFile);
        } catch (err) {
          console.error('Aadhar upload failed:', err);
          toast.error('Failed to upload Aadhar document');
          setLoading(false);
          setUploading(false);
          return;
        }
      }

      // Clean payload
      const payload = {
        ...formData,
        profilePhoto: photoUrl,
        aadhar: {
          ...formData.aadhar,
          document: aadharUrl || 'pending_upload' // Ensure strictly that we have something
        }
      };

      if (!payload.aadhar.document && !isEdit) {
        // Should have been caught by validation, but double check
        // If still empty and no file, maybe error?
        // For now let backend handle it or user re-try
      }

      if (isEdit) {
        await updateWorker(id, payload);
        toast.success('Worker updated');
      } else {
        await createWorker(payload);
        toast.success('Worker added');
      }
      window.dispatchEvent(new Event('vendorWorkersUpdated'));
      navigate('/vendor/workers');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleLinkWorker = async () => {
    if (!linkPhone.trim() || linkPhone.length < 10) {
      toast.error('Enter valid phone number');
      return;
    }
    try {
      setLoading(true);
      await linkWorker(linkPhone);
      toast.success('Worker linked successfully!');
      window.dispatchEvent(new Event('vendorWorkersUpdated'));
      navigate('/vendor/workers');
    } catch (error) {
      console.error('Link error:', error);
      toast.error(error.response?.data?.message || 'Failed to link worker');
    } finally {
      setLoading(false);
    }
  };

  // selectedCategoriesData and allAvailableSkills removed as they are no longer needed

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title={isEdit ? 'Edit Worker' : 'Add Worker'} />

      <main className="px-4 py-6 max-w-lg mx-auto">

        {/* Tabs for Add New vs Link */}
        {!isEdit && (
          <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-100">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'new'
                ? 'text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
              style={{
                background: activeTab === 'new' ? themeColors.button : 'transparent'
              }}
            >
              <FiUserPlus className="w-4 h-4" />
              Create New
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'link'
                ? 'text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
              style={{
                background: activeTab === 'link' ? themeColors.button : 'transparent'
              }}
            >
              <FiLink className="w-4 h-4" />
              Link Existing
            </button>
          </div>
        )}

        {/* Link Existing Mode */}
        {activeTab === 'link' && !isEdit && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ background: `${themeColors.button}15` }}
            >
              <FiSearch className="w-8 h-8" style={{ color: themeColors.button }} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Add Existing Worker</h3>
            <p className="text-sm text-gray-500">
              Enter the phone number of a registered worker to add them to your team.
            </p>

            <div className="pt-2">
              <input
                type="tel"
                value={linkPhone}
                onChange={(e) => setLinkPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-center text-lg font-medium tracking-wide"
                maxLength={10}
              />
            </div>

            <button
              onClick={handleLinkWorker}
              disabled={loading}
              className="w-full py-4 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              style={{
                background: themeColors.button,
                boxShadow: `0 8px 24px ${themeColors.button}40`
              }}
            >
              {loading ? 'Processing...' : 'Find & Add Worker'}
            </button>
          </div>
        )}

        {/* Create / Edit Mode */}
        {(activeTab === 'new' || isEdit) && (
          <div className="space-y-6">

            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center justify-center mb-2">
              <div className="relative group">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100"
                >
                  {photoPreview || formData.profilePhoto ? (
                    <img
                      src={photoPreview || formData.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <FiUserPlus className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <label
                  htmlFor="worker-photo-upload"
                  className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer shadow-md transition-transform active:scale-95 hover:scale-105"
                  style={{ background: themeColors.button }}
                >
                  <FiCamera className="w-4 h-4 text-white" />
                  <input
                    id="worker-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              <p className="text-gray-400 text-[10px] mt-2 font-medium">Add Profile Photo</p>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Details</h4>

              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Full Name *"
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.name ? 'border-red-500' : 'border-gray-100'}`}
                />

                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Mobile Number *"
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.phone ? 'border-red-500' : 'border-gray-100'}`}
                  maxLength={10}
                />

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email Address (Optional)"
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.email ? 'border-red-500' : 'border-gray-100'}`}
                />
              </div>
            </div>
            {/* Address Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Address</h4>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm font-medium text-gray-700">
                  {formData.address?.fullAddress ||
                    (formData.address?.addressLine1 ? `${formData.address.addressLine1}, ${formData.address.city}` : 'No address set')
                  }
                </p>
              </div>

              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <FiMapPin className="w-4 h-4" />
                Select Address on Map
              </button>
            </div>

            {/* Work Profile */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Work Profile</h4>

              {/* Category Dropdown */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Category</label>
                <div className="relative">
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <span className={`font-medium truncate ${formData.serviceCategories.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                      {formData.serviceCategories.length > 0
                        ? `${formData.serviceCategories.length} Selected`
                        : 'Select Categories'}
                    </span>
                    <FiChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCategoryOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10 bg-transparent"
                        onClick={() => setIsCategoryOpen(false)}
                      />
                      <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                        {categories.length > 0 ? (
                          categories.map(cat => (
                            <button
                              key={cat._id}
                              onClick={() => {
                                toggleCategory(cat.title);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 font-medium text-gray-700 border-b border-gray-50 last:border-0 flex items-center justify-between"
                            >
                              {cat.title}
                              {formData.serviceCategories.includes(cat.title) && (
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-400 text-sm">No categories found</div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Selected Categories Tags */}
                {formData.serviceCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.serviceCategories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
                      >
                        {cat}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCategory(cat); }}
                          className="ml-2 text-blue-500 hover:text-red-500 focus:outline-none"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.serviceCategories && <p className="text-red-500 text-[10px] mt-1">Required</p>}
              </div>

            </div>

            {/* Documents (Simplified) */}
            {
              !isEdit && (
                <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Identity Proof (Aadhar)</h4>
                  <input
                    type="text"
                    value={formData.aadhar.number}
                    onChange={(e) => handleInputChange('aadhar.number', e.target.value)}
                    placeholder="Aadhar Number *"
                    className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors['aadhar.number'] ? 'border-red-500' : 'border-gray-100'}`}
                    maxLength={12}
                  />

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center transition-colors hover:border-blue-300 bg-gray-50">
                    <input
                      id="worker-aadhar-upload"
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleAadharChange}
                    />
                    <label htmlFor="worker-aadhar-upload" className="cursor-pointer flex flex-col items-center">
                      {aadharFile ? (
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                          <FiUpload className="w-5 h-5" />
                          <span className="truncate max-w-[200px]">{aadharFile.name}</span>
                        </div>
                      ) : formData.aadhar.document && formData.aadhar.document !== 'data:image/png;base64,placeholder' ? (
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-green-600 font-medium text-sm mb-2">Document Uploaded</p>
                          <span className="text-xs text-blue-500 underline">Click to update</span>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500 font-medium">Click to upload Aadhar Card</span>
                          <span className="text-xs text-gray-400 mt-1">First Page Only (Max 5MB)</span>
                        </>
                      )}
                    </label>
                  </div>
                  {errors['aadhar.document'] && <p className="text-red-500 text-[10px] mt-1">Document is required</p>}
                </div>
              )
            }

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{
                background: themeColors.button,
                boxShadow: `0 8px 24px ${themeColors.button}40`
              }}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Details' : 'Create Worker')}
            </button>
          </div >
        )}
      </main >

      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={formData.address?.fullAddress || ''}
        houseNumber={formData.address?.addressLine1 || ''}
        onHouseNumberChange={(val) => handleInputChange('address.addressLine1', val)}
        onSave={handleAddressSave}
      />

      <BottomNav />
    </div >
  );
};

export default AddEditWorker;
