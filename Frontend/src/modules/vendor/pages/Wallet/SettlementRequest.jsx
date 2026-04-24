import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiUpload, FiCheck, FiCreditCard, FiSmartphone, FiDollarSign } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import vendorWalletService from '../../../../services/vendorWalletService';
import { toast } from 'react-hot-toast';
import flutterBridge from '../../../../utils/flutterBridge';
import { FiCamera } from 'react-icons/fi';

const SettlementRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wallet, setWallet] = useState({ amountDue: 0 });
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'upi',
    paymentReference: '',
    paymentProof: '',
    notes: ''
  });
  const [proofPreview, setProofPreview] = useState(null);

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
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const res = await vendorWalletService.getWallet();
      if (res.success) {
        setWallet(res.data);
        setFormData(prev => ({ ...prev, amount: res.data.amountDue.toString() }));
      }
    } catch (error) {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1200; // Increased slightly for better text legibility in receipts
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', 0.85); // Slightly higher quality for reference numbers
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file); // Fallback to original if canvas fails
      };
    });
  };

  const uploadToCloudinary = async (file) => {
    // 1. Get Signature from Backend
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const sigRes = await fetch(`${apiUrl}/api/upload/sign-signature`);
    const sigData = await sigRes.json();

    if (!sigData.success) {
      throw new Error(sigData.message || 'Failed to get upload signature');
    }

    const { signature, timestamp, cloudName, apiKey, folder } = sigData;

    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    if (folder) formData.append('folder', folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.secure_url;
  };

  const handleNativeCamera = async () => {
    try {
      const file = await flutterBridge.openCamera();
      if (file) {
        setProofPreview(URL.createObjectURL(file));
        const loadingToast = toast.loading('Uploading Proof...');
        const secureUrl = await uploadToCloudinary(file);
        setFormData(prev => ({ ...prev, paymentProof: secureUrl }));
        toast.dismiss(loadingToast);
        toast.success('Proof captured & uploaded!');
        flutterBridge.hapticFeedback('success');
      }
    } catch (error) {
      console.error('Native capture failed:', error);
      toast.error('Failed to capture proof');
      toast.dismiss();
    }
  };

  const handleProofUpload = async (e) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    if (originalFile.size > 20 * 1024 * 1024) {
      toast.error('File too large (max 20MB)');
      return;
    }

    const previewUrl = URL.createObjectURL(originalFile);
    setProofPreview(previewUrl);

    let loadingToast;
    try {
      loadingToast = toast.loading('Optimizing & Uploading...');

      // Compress client-side
      const file = await compressImage(originalFile);

      // Upload
      const secureUrl = await uploadToCloudinary(file);

      setFormData(prev => ({ ...prev, paymentProof: secureUrl }));
      toast.dismiss(loadingToast);
      toast.success('Proof uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload proof');
      if (loadingToast) toast.dismiss(loadingToast);
      setProofPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(formData.amount) > wallet.amountDue) {
      toast.error(`Amount cannot exceed ₹${wallet.amountDue}`);
      return;
    }

    if (!formData.paymentReference) {
      toast.error('Please enter UPI/Transaction reference');
      return;
    }

    if (!formData.paymentProof) {
      toast.error('Payment screenshot is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await vendorWalletService.requestSettlement({
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference,
        paymentProof: formData.paymentProof,
        notes: formData.notes
      });

      if (res.success) {
        toast.success('Settlement request submitted!');
        navigate('/vendor/wallet');
      } else {
        toast.error(res.message || 'Failed to submit request');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: themeColors.backgroundGradient }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${themeColors.button} transparent ${themeColors.button} ${themeColors.button}` }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: themeColors.backgroundGradient }}>
      <Header
        title="Pay to Admin"
        showBack={true}
        onBack={() => navigate('/vendor/wallet')}
      />

      <main className="px-4 py-6">
        {/* Amount Due Banner */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
          }}
        >
          <p className="text-white/80 text-sm mb-1">Total Amount Due</p>
          <p className="text-3xl font-bold text-white">₹{wallet.amountDue?.toLocaleString() || 0}</p>
        </div>

        {/* Settlement Form */}
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Settlement Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-blue-400 focus:outline-none"
                placeholder="Enter amount"
                max={wallet.amountDue}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Max: ₹{wallet.amountDue?.toLocaleString()}</p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Method *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'upi', label: 'UPI', icon: FiSmartphone },
                { id: 'bank_transfer', label: 'Bank Transfer', icon: FiCreditCard },
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                    }`}
                >
                  <method.icon className={`w-6 h-6 ${formData.paymentMethod === method.id ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={`text-sm font-semibold ${formData.paymentMethod === method.id ? 'text-blue-700' : 'text-gray-600'}`}>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Reference */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              UPI / Transaction Reference *
            </label>
            <input
              type="text"
              value={formData.paymentReference}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-blue-400 focus:outline-none"
              placeholder="Enter UPI Transaction ID or Bank Ref No."
            />
          </div>

          {/* Payment Proof */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Screenshot *
            </label>
            {proofPreview ? (
              <div className="relative">
                <img
                  src={proofPreview}
                  alt="Payment Proof"
                  className="w-full h-56 object-contain bg-gray-50 rounded-xl border-2 border-gray-200"
                />
                <button
                  onClick={() => {
                    setProofPreview(null);
                    setFormData(prev => ({ ...prev, paymentProof: '' }));
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {flutterBridge.isFlutter && (
                  <button
                    type="button"
                    onClick={handleNativeCamera}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all font-bold shadow-lg shadow-gray-200"
                  >
                    <FiCamera className="w-5 h-5" />
                    Take a Photo
                  </button>
                )}
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                  <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-700 font-semibold">
                    {flutterBridge.isFlutter ? 'Pick from Gallery' : 'Upload Screenshot / Proof'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight font-bold">Max 20MB Original</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProofUpload}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-blue-400 focus:outline-none resize-none"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !formData.amount || !formData.paymentReference || !formData.paymentProof}
          className="w-full mt-6 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: themeColors.button,
            boxShadow: `0 4px 12px ${themeColors.button}40`,
          }}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <FiSend className="w-5 h-5" />
              Submit Settlement Request
            </>
          )}
        </button>

        {/* Info */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Admin will verify your payment and update your balance within 24 hours.
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default SettlementRequest;

