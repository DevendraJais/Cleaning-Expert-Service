import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp, FiChevronRight, FiUser, FiBell, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { workerTheme as themeColors, vendorTheme } from '../../../../theme';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';
import { registerFCMToken } from '../../../../services/pushNotificationService';
import { SkeletonProfileHeader, SkeletonDashboardStats, SkeletonList } from '../../../../components/common/SkeletonLoaders';
import OptimizedImage from '../../../../components/common/OptimizedImage';
import { useSocket } from '../../../../context/SocketContext';
import WorkerJobAlertModal from '../../components/bookings/WorkerJobAlertModal';
import LogoLoader from '../../../../components/common/LogoLoader';


const Dashboard = () => {
  const navigate = useNavigate();

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected',
      'COMPLETED': 'Completed',
      'ASSIGNED': 'Assigned',
      'VISITED': 'Visited',
      'WORK_DONE': 'Work Done',
    };
    return statusMap[status] || status;
  };

  const [stats, setStats] = useState({
    pendingJobs: 0,
    acceptedJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    rating: 0,
  });
  const [workerProfile, setWorkerProfile] = useState({
    name: 'Worker Name',
    phone: '+91 9876543210',
    photo: null,
    categories: [],
    address: null,
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);

  // Set background gradient
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  const [alertJobId, setAlertJobId] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState(null);

  // Get current GPS position as a promise
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  };

  // Toggle online/offline with GPS
  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    const goingOnline = !isOnline;

    try {
      let lat, lng;
      if (goingOnline) {
        // Get GPS location before going online
        try {
          const pos = await getCurrentPosition();
          lat = pos.lat;
          lng = pos.lng;
        } catch (geoErr) {
          console.error('GPS error:', geoErr);
          const { toast } = await import('react-hot-toast');
          toast.error('Location permission required to go online. Please enable GPS.');
          setTogglingOnline(false);
          return;
        }
      }

      const res = await workerService.toggleOnline(goingOnline, lat, lng);
      if (res.success) {
        setIsOnline(goingOnline);
        const { toast } = await import('react-hot-toast');
        toast.success(res.message);

        // Start periodic location updates when online
        if (goingOnline) {
          startLocationTracking();
        } else {
          stopLocationTracking();
        }
      }
    } catch (error) {
      console.error('Toggle online error:', error);
      const { toast } = await import('react-hot-toast');
      toast.error('Failed to update status');
    } finally {
      setTogglingOnline(false);
    }
  };

  // Periodic location tracking (every 2 minutes when online)
  const startLocationTracking = () => {
    stopLocationTracking(); // clear any existing
    const id = setInterval(async () => {
      try {
        const pos = await getCurrentPosition();
        await workerService.updateLocation(pos.lat, pos.lng);
      } catch (err) {
        console.warn('Background location update failed:', err.message);
      }
    }, 2 * 60 * 1000); // Every 2 minutes
    setLocationWatchId(id);
  };

  const stopLocationTracking = () => {
    if (locationWatchId) {
      clearInterval(locationWatchId);
      setLocationWatchId(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopLocationTracking();
  }, [locationWatchId]);

  // Fetch Dashboard Data Function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch Profile, Stats and Recent Jobs in parallel (Stats also includes recent jobs but let's be robust)
      const [profileRes, statsRes, subRes] = await Promise.all([
        workerService.getProfile(),
        workerService.getDashboardStats(),
        workerService.getSubscriptionStatus()
      ]);

      if (profileRes.success) {
        const profile = profileRes.worker;
        setWorkerProfile({
          name: profile.name || 'Worker Name',
          phone: profile.phone || '',
          photo: profile.profilePhoto || null,
          categories: profile.serviceCategories || (profile.serviceCategory ? [profile.serviceCategory] : []),
          address: profile.address,
        });
        // Sync online status from DB
        setIsOnline(profile.isOnline || false);
      }

      if (statsRes.success) {
        const { totalEarnings, activeJobs, completedJobs, rating, recentJobs: apiRecentJobs } = statsRes.data;
        setStats(prev => ({
          ...prev,
          totalEarnings: totalEarnings || 0,
          thisMonthEarnings: totalEarnings || 0,
          pendingJobs: activeJobs || 0,
          acceptedJobs: activeJobs || 0,
          completedJobs: completedJobs || 0,
          rating: rating || 0
        }));

        if (apiRecentJobs && apiRecentJobs.length > 0) {
          setRecentJobs(apiRecentJobs.map(job => ({
            id: job._id,
            serviceType: job.serviceId?.title || job.serviceName || 'Service',
            customerName: job.userId?.name || 'Customer',
            location: job.address?.city || 'Location N/A',
            time: job.scheduledTime || 'N/A',
            status: job.status,
            price: job.finalAmount,
          })));
        }
      }

      if (subRes && subRes.success) {
        setSubscriptionStatus(subRes.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Load real data from API
  useEffect(() => {
    fetchDashboardData();

    // Ask for notification permission and register FCM
    registerFCMToken('worker', true).catch(err => console.error('FCM registration failed:', err));

    // Listen for updates
    const handleUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('workerJobsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('workerJobsUpdated', handleUpdate);
    };

  }, []);



  // Socket Listener for New Jobs
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notif) => {
      // Listen for new job assignments
      if ((notif.type === 'booking_created' || notif.type === 'job_assigned') && notif.relatedId) {
        setAlertJobId(notif.relatedId);
      }
    };

    socket.on('notification', handleNotification);

    // Listen for real-time alert events from SocketContext
    const handleJobAlert = (e) => {
      const jobData = e.detail;
      if (jobData && jobData.id) {
        setAlertJobId(jobData.id);
      }
    };

    window.addEventListener('showWorkerJobAlert', handleJobAlert);

    // Listen for push notifications in foreground
    const handlePushNotification = (e) => {
      const payload = e.detail;
      const data = payload.data || {};
      
      // Only open modal for real job assignments with a valid bookingId
      if (data.type === 'job_assigned' && data.bookingId && data.bookingId !== 'test-id') {
        setAlertJobId(data.bookingId);
      }
      // 'test' type notifications just show the toast - no modal
    };

    window.addEventListener('appNotificationReceived', handlePushNotification);

    return () => {
      socket.off('notification', handleNotification);
      window.removeEventListener('showWorkerJobAlert', handleJobAlert);
      window.removeEventListener('appNotificationReceived', handlePushNotification);
    };
  }, [socket, recentJobs]);

  // Test Push Notification
  const handleTestPush = async () => {
    try {
      const { toast } = await import('react-hot-toast');
      const loadingToast = toast.loading('Sending test push...');
      
      const res = await workerService.testPushNotification();
      
      toast.dismiss(loadingToast);
      if (res.success) {
        toast.success('Test push sent! Check your notification tray.');
      } else {
        toast.error(res.error || 'Failed to send test push');
      }
    } catch (err) {
      console.error('Test push error:', err);
      const { toast } = await import('react-hot-toast');
      toast.error('Error triggering test push');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
        <Header title="Dashboard" showBack={false} />
        <main className="px-4 py-4 space-y-6">
          <SkeletonProfileHeader />
          <SkeletonDashboardStats />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
            <SkeletonList count={3} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Dashboard" showBack={false} notificationCount={stats.pendingJobs} />

      <main className="pt-0">
        {/* Profile Card Section */}
        <div className="px-4 pt-4 pb-2">
          <div
            className="rounded-2xl p-4 cursor-pointer active:scale-98 transition-all duration-200 relative overflow-hidden"
            onClick={() => navigate('/worker/profile')}
            style={{
              background: themeColors.button,
              border: `2px solid ${themeColors.button}`,
            }}
          >
            {/* Decorative Pattern */}
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${themeColors.button} 0%, transparent 70%)`,
                transform: 'translate(20px, -20px)',
              }}
            />

            <div className="relative z-10 flex items-center gap-3">
              {/* Profile Photo */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.button}dd 100%)`,
                  border: `2.5px solid #FFFFFF`,
                }}
              >

                {workerProfile.photo ? (
                  <OptimizedImage
                    src={workerProfile.photo}
                    alt={workerProfile.name}
                    className="w-full h-full object-cover"
                    width={56}
                    height={56}
                  />
                ) : (
                  <FiUser className="w-7 h-7" style={{ color: '#FFFFFF' }} />
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold uppercase tracking-wider mb-0.5" style={{
                  color: '#FFFFFF',
                  textShadow: `1px 1px 0px rgba(0, 0, 0, 0.2)`,
                  letterSpacing: '0.12em',
                }}>
                  WELCOME !
                </p>
                <h2 className="text-base font-bold text-white truncate mb-0.5">{workerProfile.name}</h2>
                {workerProfile.categories && workerProfile.categories.length > 0 && (
                  <p className="text-xs text-white truncate font-medium opacity-90">
                    {workerProfile.categories.join(', ')}
                  </p>
                )}
              </div>

              {/* Arrow Icon */}
              <div
                className="p-2.5 rounded-lg shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.35)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                <FiChevronRight className="w-6 h-6" style={{ color: '#FFFFFF', fontWeight: 'bold' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status Alert */}
        {subscriptionStatus && (
          <div className="px-4 pt-2 -mb-2">
            {!subscriptionStatus.isActive ? (
              <div
                onClick={() => navigate('/worker/subscription')}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm cursor-pointer hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiClock className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-red-700">Plan Expired!</p>
                    <p className="text-xs text-red-600">
                      Your subscription ended on {new Date(subscriptionStatus.expiryDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}.
                    </p>
                  </div>
                  <div className="ml-auto">
                    <FiArrowRight className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              </div>
            ) : (() => {
              const diff = new Date(subscriptionStatus.expiryDate) - new Date();
              const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
              if (days <= 3) {
                return (
                  <div
                    onClick={() => navigate('/worker/subscription')}
                    className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiClock className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-bold text-amber-700">Plan Expiring Soon!</p>
                        <p className="text-xs text-amber-600">
                          Expires on {new Date(subscriptionStatus.expiryDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}.
                        </p>
                      </div>
                      <div className="ml-auto">
                        <FiArrowRight className="h-4 w-4 text-amber-500" />
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}

        {/* Incomplete Profile Prompt */}
        {((!workerProfile.categories || workerProfile.categories.length === 0) ||
          (!workerProfile.address || Object.keys(workerProfile.address).length === 0)) && (
            <div className="px-4 pt-2 -mb-2">
              <div
                onClick={() => navigate('/worker/profile')}
                className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r shadow-sm cursor-pointer hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiClock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-orange-700">Profile Incomplete</p>
                    <p className="text-sm text-orange-600">
                      Complete your profile (Address and Category) to start receiving jobs.
                    </p>
                  </div>
                  <div className="ml-auto">
                    <FiArrowRight className="h-4 w-4 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Online/Offline Toggle */}
        <div className="px-4 pt-3 pb-1">
          <div
            className="rounded-2xl p-4 flex items-center justify-between transition-all duration-500"
            style={{
              background: isOnline
                ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                : 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
              boxShadow: isOnline
                ? '0 4px 20px rgba(16, 185, 129, 0.35)'
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: isOnline ? '#a7f3d0' : '#9ca3af' }}
              />
              <div>
                <p className="text-white font-bold text-sm">
                  {isOnline ? '🟢 You are Online' : '🔴 You are Offline'}
                </p>
                <p className="text-white/70 text-xs">
                  {isOnline ? 'Receiving job alerts • GPS active' : 'Go online to receive jobs'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleOnline}
              disabled={togglingOnline}
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: isOnline ? 'rgba(255,255,255,0.2)' : 'white',
                color: isOnline ? 'white' : '#059669',
                border: isOnline ? '1px solid rgba(255,255,255,0.3)' : 'none',
              }}
            >
              {togglingOnline ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>...</span>
                </div>
              ) : isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>

        {/* Notification Status & Debug - NEW */}
        <div className="px-4 py-2">
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${Notification.permission === 'granted' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
              />
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Notification Status</p>
                <p className={`text-xs font-bold ${Notification.permission === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
                  {Notification.permission === 'granted' ? '✅ Active & Ready' : '❌ Blocked / Not Setup'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
               <button 
                onClick={() => {
                  if (window.fcmDebug) window.fcmDebug();
                  if (window.testLocalFCMUI) window.testLocalFCMUI();
                }}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 active:scale-95 transition-all"
               >
                 TEST UI
               </button>
               <button 
                onClick={async () => {
                   const { registerFCMToken } = await import('../../../../services/pushNotificationService');
                   registerFCMToken('worker', true);
                }}
                className="p-2 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold hover:bg-orange-100 active:scale-95 transition-all"
               >
                 RE-REGISTER
               </button>
            </div>
          </div>
          {Notification.permission !== 'granted' && (
            <p className="text-[9px] text-red-500 font-bold mt-1 px-1">
              ⚠️ Notifications are disabled in your browser. Click the lock icon in the URL bar to fix.
            </p>
          )}
        </div>

        {/* Stats Cards - Outside Gradient */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Card 1: This Month Earnings - Dark Blue Gradient */}
            <div
              onClick={() => navigate('/worker/jobs')}
              className="rounded-xl p-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #001947 0%, #003b77 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Decorative Pattern */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                  transform: 'translate(20px, -20px)',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-white font-semibold mb-1 opacity-90 uppercase tracking-wide">This Month</p>
                    <p className="text-2xl font-bold text-white leading-tight">
                      ₹{stats.thisMonthEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <FaWallet className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <FiTrendingUp className="w-4 h-4 text-white opacity-80" />
                  <span className="text-xs text-white opacity-80 font-medium">Earnings</span>
                </div>
              </div>
            </div>

            {/* Card 2: Pending Jobs - Light Blue Gradient */}
            <div
              onClick={() => navigate('/worker/jobs')}
              className="rounded-xl p-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #406788 0%, #304a63 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Decorative Pattern */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                  transform: 'translate(20px, -20px)',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-white font-semibold mb-1 opacity-90 uppercase tracking-wide">Pending Jobs</p>
                    <p className="text-2xl font-bold text-white leading-tight">
                      {stats.pendingJobs}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <FiClock className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <FiCheckCircle className="w-4 h-4 text-white opacity-80" />
                  <span className="text-xs text-white opacity-80 font-medium">Waiting</span>
                </div>
              </div>
            </div>

            {/* Card 3: Accepted Jobs - Light Blue Gradient */}
            <div
              onClick={() => navigate('/worker/jobs')}
              className="rounded-xl p-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #406788 0%, #304a63 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Decorative Pattern */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                  transform: 'translate(20px, -20px)',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-white font-semibold mb-1 opacity-90 uppercase tracking-wide">Accepted</p>
                    <p className="text-2xl font-bold text-white leading-tight">
                      {stats.acceptedJobs}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <FiCheckCircle className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <FiBriefcase className="w-4 h-4 text-white opacity-80" />
                  <span className="text-xs text-white opacity-80 font-medium">Active</span>
                </div>
              </div>
            </div>

            {/* Card 4: Completed Jobs - Dark Blue Gradient */}
            <div
              onClick={() => navigate('/worker/jobs')}
              className="rounded-xl p-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #001947 0%, #003b77 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Decorative Pattern */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                  transform: 'translate(20px, -20px)',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-white font-semibold mb-1 opacity-90 uppercase tracking-wide">Completed</p>
                    <p className="text-2xl font-bold text-white leading-tight">
                      {stats.completedJobs}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <FiBriefcase className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <FiCheckCircle className="w-4 h-4 text-white opacity-80" />
                  <span className="text-xs text-white opacity-80 font-medium">Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Jobs Section */}
        <div className="px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Jobs</h2>
            {recentJobs.length > 0 && (
              <button
                onClick={() => navigate('/worker/jobs')}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 active:scale-95 text-white"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.button}dd 100%)`,
                  boxShadow: `0 4px 12px ${themeColors.button}40, 0 2px 6px ${themeColors.button}30`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 16px ${themeColors.button}50, 0 3px 8px ${themeColors.button}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${themeColors.button}40, 0 2px 6px ${themeColors.button}30`;
                }}
              >
                View All
              </button>
            )}
          </div>
          {recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.map((job, index) => {
                // Alternating colors
                const isDarkBlue = index % 2 === 0;
                const accentColor = isDarkBlue ? '#001947' : '#406788';

                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/worker/job/${job.id}`)}
                    className="bg-white rounded-xl shadow-lg cursor-pointer active:scale-98 transition-all duration-200 relative overflow-hidden"
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {/* Left accent border */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
                      style={{
                        background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                      }}
                    />

                    {/* Compact Content */}
                    <div className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        {/* Profile Image Circle */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                          style={{
                            border: `2.5px solid ${accentColor}40`,
                            boxShadow: `0 2px 8px ${accentColor}40, inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
                            background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`,
                          }}
                        >
                          <FiUser className="w-5 h-5" style={{ color: accentColor }} />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          {/* Name and Service in one line */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="text-sm font-bold text-gray-800 truncate">{job.customerName}</p>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-lg shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                                color: '#FFFFFF',
                                boxShadow: `0 2px 5px ${hexToRgba(accentColor, 0.3)}`,
                              }}
                            >
                              {job.serviceType || 'Service'}
                            </span>
                          </div>

                          {/* Address, Time, Status in one line */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div
                              className="flex items-center gap-1 px-2 py-0.5 rounded"
                              style={{
                                background: 'rgba(0, 166, 166, 0.1)',
                                border: '1px solid rgba(0, 166, 166, 0.2)',
                              }}
                            >
                              <FiMapPin className="w-3 h-3" style={{ color: themeColors.button }} />
                              <span className="text-xs font-semibold text-gray-700 truncate max-w-[100px]">{job.location}</span>
                            </div>
                            <div
                              className="flex items-center gap-1 px-2 py-0.5 rounded"
                              style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                              }}
                            >
                              <FiClock className="w-3 h-3" style={{ color: '#F59E0B' }} />
                              <span className="text-xs font-semibold text-gray-700">{job.time}</span>
                            </div>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: `${accentColor}15`,
                                color: accentColor,
                                border: `1px solid ${accentColor}30`,
                              }}
                            >
                              {getStatusLabel(job.status)}
                            </span>
                          </div>
                        </div>

                        {/* Navigate Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/worker/job/${job.id}`);
                          }}
                          className="p-2 rounded-lg shrink-0 transition-all duration-300 active:scale-95"
                          style={{
                            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                            boxShadow: `0 3px 10px ${hexToRgba(accentColor, 0.3)}, 0 2px 5px ${hexToRgba(accentColor, 0.2)}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = `0 5px 14px ${hexToRgba(accentColor, 0.4)}, 0 3px 7px ${hexToRgba(accentColor, 0.3)}`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = `0 3px 10px ${hexToRgba(accentColor, 0.3)}, 0 2px 5px ${hexToRgba(accentColor, 0.2)}`;
                          }}
                        >
                          <FiArrowRight className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="bg-white rounded-xl p-8 text-center shadow-md"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <FiBriefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-semibold mb-2">No jobs assigned yet</p>
              <p className="text-sm text-gray-500">
                You'll see assigned jobs here when partners or admin assign work to you
              </p>
            </div>
          )}
        </div>
      </main>

        {/* Test Push Notification Floating Button */}
        <div className="fixed bottom-24 right-4 z-40">
          <button
            onClick={handleTestPush}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 16px rgba(245, 124, 0, 0.4)',
            }}
            title="Test Push Notification"
          >
            <FiBell className="w-7 h-7 text-white" />
          </button>
        </div>

      <WorkerJobAlertModal
        isOpen={!!alertJobId}
        jobId={alertJobId}
        onClose={() => setAlertJobId(null)}
        onJobAccepted={(id) => {
          fetchDashboardData();
          navigate(`/worker/job/${id}`);
        }}
      />


    </div >
  );
};

export default Dashboard;


