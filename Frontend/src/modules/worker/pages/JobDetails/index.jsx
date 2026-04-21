import React, { useState, useEffect, useLayoutEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMapPin, FiPhone, FiClock, FiUser, FiCheck, FiX, FiArrowRight, FiNavigation, FiTool, FiCheckCircle, FiDollarSign, FiCamera, FiPlus, FiTrash, FiXCircle, FiAward, FiFileText } from 'react-icons/fi';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import { SkeletonCard } from '../../../../components/common/SkeletonLoaders';

const CashCollectionModal = lazy(() => import('../../components/common/CashCollectionModal'));
const VisitVerificationModal = lazy(() => import('../../components/common/VisitVerificationModal'));
const WorkCompletionModal = lazy(() => import('../../components/common/WorkCompletionModal'));
const OtpVerificationModal = lazy(() => import('../../components/common/OtpVerificationModal'));
import workerService from '../../../../services/workerService';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { useAppNotifications } from '../../../../hooks/useAppNotifications';
import { useLocationTracking } from '../../../../hooks/useLocationTracking';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState(['', '', '', '']); // Array for 4 digit OTP
  const [workPhotos, setWorkPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [collectionAmount, setCollectionAmount] = useState('');
  const actionLoadingRef = useRef(false);

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

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await workerService.getJobById(id);
      if (response.success) {
        // Map items for consistency
        const data = response.data;
        setJob({
          ...data,
          items: data.bookedItems || []
        });
      }
      setLoading(false);
    } catch (error) {
      // Error fetching job details
      toast.error('Failed to load job details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  // Socket for live location tracking
  const socket = useAppNotifications('worker');

  // Optimized Live Location Tracking with distance filter and heading
  const isTrackingActive = job?.status === 'journey_started' || job?.status === 'visited' || job?.status === 'in_progress';
  useLocationTracking(socket, id, isTrackingActive, {
    distanceFilter: 10, // Only emit when moved 10+ meters
    interval: 3000,     // Minimum 3s between emissions
    enableHighAccuracy: true
  });

  // Listen for Real-Time Job Updates (e.g. Online Payment)
  useEffect(() => {
    if (socket && id) {
      const handleJobUpdate = (data) => {
        if (data.bookingId === id || data.relatedId === id || data._id === id) {
          setJob(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              ...data,
              status: data.status || prev.status,
              paymentStatus: data.paymentStatus || prev.paymentStatus
            };
          });

          const isPaymentSuccess =
            data.paymentStatus === 'SUCCESS' ||
            data.paymentStatus === 'paid' ||
            data.type === 'payment_success';

          if (isPaymentSuccess) {
            toast.success('Online Payment Received!');
            setTimeout(() => fetchJobDetails(), 1500);
          }
        }
      };

      socket.on('booking_updated', handleJobUpdate);
      socket.on('payment_success', handleJobUpdate);

      return () => {
        socket.off('booking_updated', handleJobUpdate);
        socket.off('payment_success', handleJobUpdate);
      };
    }
  }, [socket, id]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    // Mimic upload process using FileReader (Converting to Base64 for now)
    const uploadPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises).then(urls => {
      setWorkPhotos(prev => [...prev, ...urls]);
      setIsUploading(false);
    });
  };

  const handleRemovePhoto = (index) => {
    setWorkPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleInitiateCashOTP = async (totalAmount, extraItems = []) => {
    try {
      setActionLoading(true);
      const res = await workerService.initiateCashCollection(id, totalAmount, extraItems);
      if (res.success) {
        return res;
      } else {
        throw new Error(res.message || 'Failed to send OTP');
      }
    } catch (error) {
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCash = async (totalAmount, extraItems, otp) => {
    try {
      setActionLoading(true);
      const response = await workerService.collectCash(id, otp, totalAmount, extraItems);
      if (response.success) {
        toast.success('Payment collected & Job Completed!');
        setIsPaymentModalOpen(false);
        fetchJobDetails();
      }
    } catch (error) {
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleJobResponse = async (status) => {
    if (actionLoadingRef.current) return;
    actionLoadingRef.current = true;
    try {
      setActionLoading(true);
      const response = (await api.put(`/workers/jobs/${id}/respond`, { status })).data;
      if (response.success) {
        toast.success(status === 'ACCEPTED' ? 'Job Accepted' : 'Job Declined');
        if (status === 'ACCEPTED') {
          fetchJobDetails();
        } else {
          navigate('/worker/jobs');
        }
      } else {
        toast.error(response.message || 'Failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
      setTimeout(() => { actionLoadingRef.current = false; }, 500);
    }
  };

  const handleStatusUpdate = async (type) => {
    if (type === 'visit' && !isVisitModalOpen) {
      if (job.status === 'journey_started') {
        try {
          await workerService.workerReached(id);
          toast.success('Customer notified that you reached');
        } catch (e) {
          // Reached notification failed
        }
      }
      setIsVisitModalOpen(true);
      return;
    }

    if (type === 'complete') {
      setIsCompletionModalOpen(true);
      return;
    }

    if (type === 'collect') {
      const hasOTP = job?.customerConfirmationOTP || job?.paymentOtp;
      if (hasOTP) {
        setIsPaymentModalOpen(true);
      } else {
        navigate(`/worker/job/${id}/billing`);
      }
      return;
    }

    try {
      setActionLoading(true);
      let response;
      if (type === 'start') {
        response = await workerService.startJob(id);
        navigate(`/worker/job/${id}/map`); // Navigate to map on start
        return;
      } else if (type === 'complete') {
        if (workPhotos.length === 0) {
          toast.error('Please upload at least one work photo');
          setActionLoading(false);
          return;
        }
        response = await workerService.completeJob(id, { workPhotos });
      }

      if (response && response.success) {
        toast.success(response.message || 'Updated successfully');
        setIsCompletionModalOpen(false);
        // Navigate to billing immediately after work is done
        navigate(`/worker/job/${id}/billing`);
      }
      setActionLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
        <Header title="Job Details" />
        <main className="px-4 py-6 space-y-4">
          <div className="h-16 bg-white/50 rounded-2xl animate-pulse mb-6"></div>
          <SkeletonCard className="h-32 mb-6" />
          <SkeletonCard className="h-48 mb-6" />
          <SkeletonCard className="h-40" />
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ background: themeColors.backgroundGradient }}>
        <div>
          <FiXCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-bold text-xl mb-4">Job not found</p>
          <button onClick={() => navigate('/worker/jobs')} className="px-6 py-3 bg-blue-600 text-white rounded-xl">Back to Jobs</button>
        </div>
      </div>
    );
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'confirmed': 'Assigned', // Legacy?
      'assigned': 'Assigned',
      'visited': 'Visited',
      'journey_started': 'On The Way',
      'in_progress': 'In Progress',
      'work_done': 'Work Done',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    };
    return labels[status.toLowerCase()] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#F59E0B',
      'confirmed': '#3B82F6',
      'assigned': '#3B82F6',
      'journey_started': '#3B82F6',
      'visited': '#F59E0B',
      'in_progress': '#F59E0B',
      'work_done': '#10B981',
      'completed': '#10B981',
      'cancelled': '#EF4444',
    };
    return colors[status.toLowerCase()] || '#6B7280';
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Job Details" />

      <main className="px-4 py-6">
        {/* View Timeline Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/worker/job/${id}/timeline`)}
            className="w-full bg-white border border-gray-200 py-4 rounded-2xl font-bold text-gray-700 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-lg mb-4"
          >
            <FiClock className="w-5 h-5 text-gray-500" />
            View Job Timeline
          </button>

          {(!job.workerResponse || job.workerResponse === 'PENDING') && (job.status === 'confirmed' || job.status === 'assigned' || job.status === 'pending') && (
            <div className="flex gap-3 mb-4 animate-in slide-in-from-top-2">
              <button
                onClick={() => handleJobResponse('REJECTED')}
                disabled={actionLoading}
                className="flex-1 py-4 rounded-2xl font-bold text-red-500 bg-red-50 border border-red-100 shadow-sm active:scale-95 transition-all"
              >
                DECLINE
              </button>
              <button
                onClick={() => handleJobResponse('ACCEPTED')}
                disabled={actionLoading}
                className="flex-1 py-4 rounded-2xl font-bold text-white shadow-xl active:scale-95 transition-all"
                style={{ background: themeColors.button }}
              >
                ACCEPT JOB
              </button>
            </div>
          )}

          {job.workerResponse === 'ACCEPTED' && (job.status === 'confirmed' || job.status === 'assigned') && (
            <button
              onClick={() => handleStatusUpdate('start')}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
              style={{ background: themeColors.button }}
            >
              {actionLoading ? 'Loading...' : <>START JOURNEY <FiNavigation className="w-5 h-5" /></>}
            </button>
          )}

          {job.status === 'journey_started' && (
            <button
              onClick={() => navigate(`/worker/job/${id}/map`)}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
            >
              <FiNavigation className="w-5 h-5" /> TRACK JOURNEY / REACHED
            </button>
          )}

          {(job.status === 'visited' || job.status === 'in_progress') && (
            <button
              onClick={() => handleStatusUpdate('complete')}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            >
              {actionLoading ? 'Loading...' : <>COMPLETE WORK <FiCheckCircle className="w-5 h-5" /></>}
            </button>
          )}

          {job.status === 'work_done' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(`/worker/job/${id}/billing`)}
                disabled={actionLoading}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
              >
                <FiFileText className="w-5 h-5" /> PREPARE BILL / EDIT
              </button>

              {(job?.customerConfirmationOTP || job?.paymentOtp) && (
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={actionLoading}
                  className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
                  style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                >
                  <FiKey className="w-5 h-5" /> ENTER OTP
                </button>
              )}
            </div>
          )}

          {job.status === 'completed' && (
            <div className="bg-green-100 border-2 border-green-500 rounded-2xl p-4 text-center text-green-700 font-bold shadow-md">
              <FiCheckCircle className="w-8 h-8 mx-auto mb-2" />
              JOB COMPLETED & SETTLED
            </div>
          )}
        </div>

        {/* Customer Info Card */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-gray-50">
              <FiUser className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{job.userId?.name || 'Customer'}</h3>
              <p className="text-sm text-gray-500">{job.serviceName}</p>
            </div>
            {job.userId?.phone && (
              <a href={`tel:${job.userId.phone}`} className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 active:scale-90 transition-transform">
                <FiPhone className="w-5 h-5" />
              </a>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-50">
            {/* Address Card with Map */}
            <div className="mt-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-start gap-3 mb-3">
                <FiMapPin className="w-5 h-5 mt-0.5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase">Service Location</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {job.address?.addressLine1}, {job.address?.city}
                  </p>
                </div>
              </div>

              {/* Map Embed */}
              <div
                className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-gray-200 border border-blue-100 relative group cursor-pointer"
                onClick={() => navigate(`/worker/job/${id}/map`)}
              >
                {(() => {
                  const fullAddress = `${job.address?.addressLine1 || ''}, ${job.address?.city || ''}`;
                  const mapQuery = encodeURIComponent(fullAddress);

                  return (
                    <>
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0, pointerEvents: 'none' }}
                        src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
                        allowFullScreen
                        loading="lazy"
                        tabIndex="-1"
                      ></iframe>
                      {/* Overlay to intercept clicks */}
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors flex items-center justify-center">
                        <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          View Route
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <button
                onClick={() => navigate(`/worker/job/${id}/map`)}
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{ background: themeColors.button }}
              >
                <FiNavigation className="w-4 h-4" />
                View Route
              </button>
            </div>

            <div className="flex items-start gap-3">
              <FiClock className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Scheduled Time</p>
                <p className="text-sm text-gray-700 font-medium">
                  {new Date(job.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-sm font-bold text-blue-600 mt-0.5">{job.scheduledTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booked Services List */}
        {job.items && job.items.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-md">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTool className="w-5 h-5 text-gray-500" /> Booked Services
            </h4>
            <div className="space-y-4">
              {job.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-gray-800">{item.card?.title || 'Service Item'}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase">{item.sectionTitle || 'General'}</p>
                    {item.card?.features && item.card.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.card.features.map((f, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Details - Professional Card (Matched with Vendor) */}
        <div
          className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100"
          style={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <div className={`p-2 rounded-lg ${job.paymentMethod === 'plan_benefit' ? 'bg-amber-100' : 'bg-gray-100'}`}>
              <FiDollarSign className="w-5 h-5" style={{ color: job.paymentMethod === 'plan_benefit' ? '#d97706' : themeColors.button }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                {job.paymentMethod === 'plan_benefit' ? 'Plan Benefit Summary' : 'Payment Summary'}
              </h3>
              {job.paymentMethod === 'plan_benefit' && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  Plan Membership Active
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {/* Base Items */}
            <div className="flex justify-between items-center text-gray-600">
              <span>Base Price</span>
              {job.paymentMethod === 'plan_benefit' ? (
                <div className="flex items-center gap-2">
                  <span className="line-through text-gray-400 text-xs">₹{(job.basePrice || 0).toFixed(2)}</span>
                  <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">FREE ✓</span>
                </div>
              ) : (
                <span>₹{(job.basePrice || 0).toFixed(2)}</span>
              )}
            </div>

            {(job.tax > 0 || job.paymentMethod === 'plan_benefit') && (
              <div className="flex justify-between items-center text-gray-600">
                <span>Tax</span>
                {job.paymentMethod === 'plan_benefit' ? (
                  <div className="flex items-center gap-2">
                    <span className="line-through text-gray-400 text-xs">₹{(job.tax || 0).toFixed(2)}</span>
                    <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">FREE ✓</span>
                  </div>
                ) : (
                  <span>+₹{(job.tax || 0).toFixed(2)}</span>
                )}
              </div>
            )}

            {(job.visitingCharges > 0 || job.paymentMethod === 'plan_benefit') && (
              <div className="flex justify-between items-center text-gray-600">
                <span>Convenience Fee</span>
                {job.paymentMethod === 'plan_benefit' ? (
                  <div className="flex items-center gap-2">
                    <span className="line-through text-gray-400 text-xs">₹{(job.visitingCharges || 0).toFixed(2)}</span>
                    <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">FREE ✓</span>
                  </div>
                ) : (
                  <span>+₹{(job.visitingCharges || 0).toFixed(2)}</span>
                )}
              </div>
            )}

            {job.paymentMethod !== 'plan_benefit' && job.discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount</span>
                <span>-₹{(job.discount || 0).toFixed(2)}</span>
              </div>
            )}

            {/* Extra Charges Section */}
            {job.extraCharges && job.extraCharges.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Extra Charges (User Pays)</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                  {job.extraCharges.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-white border px-1.5 rounded text-gray-500">x{item.quantity || 1}</span>
                        <span>{item.name}</span>
                      </span>
                      <span className="font-medium">+₹{(item.total || item.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-blue-600 pt-2 mt-2 border-t border-gray-200">
                    <span>Subtotal Extras</span>
                    <span>+₹{(job.extraChargesTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="my-4 border-t border-gray-200"></div>

            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-900 font-bold">Total Amount (User Pays)</span>
              <span className="text-2xl font-bold text-gray-900">
                ₹{(job.paymentMethod === 'plan_benefit' ? (job.extraChargesTotal || 0) : (job.finalAmount || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Details Extra */}
        <div className="bg-gray-50 rounded-2xl p-5 shadow-inner mb-6 border border-gray-100">
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-4">
            <span>Booking Number</span>
            <span className="text-gray-600">{job.bookingNumber}</span>
          </div>

          {job.status === 'completed' && (
            <div className="mb-2">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                <span>Completed At</span>
                <span className="text-gray-600">{new Date(job.completedAt).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Unified Worker Completion Modal - REUSABLE COMPONENT */}
      <Suspense fallback={null}>
        <WorkCompletionModal
          isOpen={isCompletionModalOpen}
          onClose={() => setIsCompletionModalOpen(false)}
          job={job}
          onComplete={(photos) => {
            // Pass photos to the handler
            setWorkPhotos(photos);
            (async () => {
              try {
                setActionLoading(true);
                const response = await workerService.completeJob(id, { workPhotos: photos });
                if (response && response.success) {
                  toast.success(response.message || 'Updated successfully');
                  setIsCompletionModalOpen(false);
                  navigate(`/worker/job/${id}/billing`);
                }
                setActionLoading(false);
              } catch (error) {
                toast.error(error.response?.data?.message || 'Action failed');
                setActionLoading(false);
              }
            })();
          }}
          loading={actionLoading}
        />
      </Suspense>

      {/* Visit OTP Modal - REUSABLE COMPONENT */}
      <Suspense fallback={null}>
        <VisitVerificationModal
          isOpen={isVisitModalOpen}
          onClose={() => setIsVisitModalOpen(false)}
          bookingId={id}
          onSuccess={() => {
            setIsVisitModalOpen(false);
            fetchJobDetails();
          }}
        />
      </Suspense>

      {/* Verification OTP Modal */}
      <Suspense fallback={null}>
        <OtpVerificationModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onVerify={(otp) => {
            const amount = job.finalAmount || 0;
            const extraItems = job.extraCharges || [];
            handleConfirmCash(amount, extraItems, otp);
          }}
          loading={actionLoading}
        />
      </Suspense>
    </div>
  );
};

export default JobDetails;
