import React, { useState, useEffect } from 'react';
import { FiX, FiMapPin, FiClock, FiArrowRight, FiBell, FiBriefcase, FiMinimize2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { playAlertRing, stopAlertRing } from '../../../../utils/notificationSound';
import workerService from '../../../../services/workerService';
import { toast } from 'react-hot-toast';

const WorkerJobAlertModal = ({ isOpen, jobId, onClose, onJobAccepted }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (isOpen && jobId) {
      loadJobDetails();
      playAlertRing(true);
      setTimeLeft(60);
    } else {
      stopAlertRing();
      setJob(null);
    }
    return () => stopAlertRing();
  }, [isOpen, jobId]);

  useEffect(() => {
    if (!job || !isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose(); // Auto-close if not responded
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [job, isOpen, onClose]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const res = await workerService.getJobById(jobId);
      if (res.success) {
        setJob(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      const res = await workerService.respondToJob(jobId, 'ACCEPTED');
      if (res.success) {
        toast.success('Job Accepted Successfully!');
        onJobAccepted && onJobAccepted(jobId);
        onClose();
      } else {
        toast.error(res.message || 'Failed to accept job');
      }
    } catch (error) {
      toast.error('Failed to accept job');
    }
  };

  const handleReject = async () => {
    try {
      const res = await workerService.respondToJob(jobId, 'REJECTED');
      if (res.success) {
        toast.success('Job Declined');
        onClose();
      } else {
        toast.error(res.message || 'Failed to reject job');
      }
    } catch (error) {
      toast.error('Failed to decline job');
    }
  };

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / 60) * circumference;
  const dashoffset = circumference - progress;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="bg-white w-full max-w-[320px] rounded-[2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative"
        >
          {/* Compact Header */}
          <div className="relative h-24 bg-gradient-to-br from-blue-900 to-indigo-900 flex flex-col items-center justify-center pt-1">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full"
              />
            </div>

            <div className="relative z-10 mb-0.5">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center shadow-lg relative">
                <FiBell className="w-5 h-5 text-white animate-bounce" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              </div>
            </div>

            <h2 className="relative z-10 text-white text-lg font-black tracking-tight">New Job!</h2>
            <div className="relative z-10 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10 text-[8px] font-bold text-white uppercase tracking-widest">
              Action Required
            </div>
          </div>

          {/* Body Section */}
          <div className="px-5 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Syncing details...</p>
              </div>
            ) : job ? (
              <>
                {/* Timer Circle */}
                <div className="flex justify-center -mt-10 mb-3">
                  <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl p-0.5">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="5" />
                      <motion.circle
                        cx="40" cy="40" r={radius} fill="none"
                        stroke={timeLeft <= 10 ? '#EF4444' : '#1E3A8A'} strokeWidth="6"
                        strokeDasharray={circumference} strokeDashoffset={dashoffset}
                        strokeLinecap="round" className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="text-center">
                      <span className={`text-xl font-black block leading-none ${timeLeft <= 10 ? 'text-red-500' : 'text-blue-900'}`}>{timeLeft}</span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Sec left</span>
                    </div>
                  </div>
                </div>

                {/* Distance/Location info */}
                <div className="flex items-center justify-center mb-4 bg-blue-50/50 py-2 rounded-xl border border-blue-100/50">
                  <div className="text-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] mb-0.5 block">Travel Distance</span>
                    <div className="text-xl font-black text-blue-900 tracking-tight flex items-center gap-1 justify-center">
                      <FiMapPin className="w-3.5 h-3.5" />
                      {job.distance ? (typeof job.distance === 'number' ? `${job.distance.toFixed(1)} km` : job.distance) : 'Near You'}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[1.25rem] p-3 border border-blue-100 shadow-[0_8px_25px_-5px_rgba(30,58,138,0.1)] relative overflow-hidden mb-4">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-900" />
                  <div className="pl-2">
                    <p className="text-[9px] font-black text-blue-600/80 uppercase tracking-[0.15em] mb-0.5">Service Requested</p>
                    <h4 className="text-[15px] font-black text-gray-900 leading-snug">
                      {job.serviceType || job.serviceId?.title || 'Service Request'}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight line-clamp-1">
                      {typeof job.address === 'string' ? job.address : (job.address?.addressLine1 || job.location?.address)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleAccept}
                    className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group"
                  >
                    Accept Job
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={handleReject}
                    className="w-full py-2.5 rounded-xl bg-red-50 text-red-500 font-bold text-[10px] active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-1.5 border border-red-100"
                  >
                    <FiX className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-500 font-bold text-sm">Booking details missing.</p>
                <button onClick={onClose} className="mt-4 text-xs font-bold text-gray-400 uppercase underline">Dismiss</button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WorkerJobAlertModal;
