import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiCheck, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { getBookingById, assignWorker as assignWorkerApi } from '../../services/bookingService';
import { getWorkers } from '../../services/workerService';

const AssignWorker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [assignToSelf, setAssignToSelf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

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
    const loadData = async () => {
      try {
        setLoading(true);
        // Load booking details
        const bookingRes = await getBookingById(id);
        if (bookingRes.booking || bookingRes.data) {
          setBooking(bookingRes.booking || bookingRes.data);
        } else {
          throw new Error('Booking not found');
        }

        // Load workers
        const workersRes = await getWorkers();
        // Handle potentially different response structures
        const workersList = Array.isArray(workersRes) ? workersRes : (workersRes.workers || workersRes.data || []);

        // Filter available workers
        const available = workersList.filter(w => {
          const status = (w.status || w.availability || '').toUpperCase();
          return (status === 'ONLINE' || status === 'ACTIVE') && !w.currentJob;
        });
        setWorkers(available);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load booking or workers');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const handleAssign = async () => {
    if (!assignToSelf && !selectedWorker) {
      toast.error('Please select a worker or assign to yourself');
      return;
    }

    try {
      setAssigning(true);

      const workerId = assignToSelf ? 'SELF' : selectedWorker.id || selectedWorker._id;

      const response = await assignWorkerApi(id, workerId);

      if (response && response.success) {
        toast.success('Worker assigned successfully');
        // Notify other components
        window.dispatchEvent(new Event('vendorJobsUpdated'));
        navigate(`/vendor/booking/${id}`);
      } else {
        throw new Error(response?.message || 'Failed to assign worker');
      }
    } catch (error) {
      console.error('Error assigning worker:', error);
      toast.error(error.message || 'Failed to assign worker. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: themeColors.backgroundGradient }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: themeColors.button }}></div>
          <p className="text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  // Helper for address display
  const getAddressString = (addr) => {
    if (!addr) return 'Address not available';
    if (typeof addr === 'string') return addr;
    return `${addr.addressLine1 || ''}, ${addr.city || ''} ${addr.pincode || ''}`;
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Assign Worker" />

      <main className="px-4 py-6">
        {/* Booking Summary */}
        <div
          className="bg-white rounded-xl p-4 mb-6 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3 className="font-bold text-gray-800 mb-2">{booking.serviceName || booking.serviceId?.title || 'Service'}</h3>
          <p className="text-sm text-gray-600">{getAddressString(booking.address || booking.location)}</p>
          <p className="text-sm font-semibold mt-2" style={{ color: themeColors.button }}>
            ₹{booking.finalAmount || booking.price || 0}
          </p>
        </div>

        {/* Self Assignment Option */}
        <div className="mb-6">
          <button
            onClick={() => {
              setAssignToSelf(true);
              setSelectedWorker(null);
            }}
            className={`w-full p-4 rounded-xl text-left transition-all ${assignToSelf
              ? 'border-2'
              : 'bg-white border border-gray-200'
              }`}
            style={
              assignToSelf
                ? {
                  borderColor: themeColors.button,
                  background: `${themeColors.button}10`,
                }
                : {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }
            }
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${assignToSelf ? 'bg-white' : 'bg-gray-100'
                  }`}
                style={
                  assignToSelf
                    ? {
                      border: `3px solid ${themeColors.button}`,
                    }
                    : {}
                }
              >
                {assignToSelf ? (
                  <FiCheck className="w-6 h-6" style={{ color: themeColors.button }} />
                ) : (
                  <FiUser className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">I'll do this job myself</h3>
                <p className="text-sm text-gray-600">Assign the booking to yourself</p>
              </div>
            </div>
          </button>
        </div>

        {/* Available Workers */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Available Workers</h3>
          {workers.length === 0 ? (
            <div
              className="bg-white rounded-xl p-6 text-center shadow-md"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <FiUser className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 mb-2">No available workers</p>
              <p className="text-sm text-gray-500 mb-4">All workers are currently assigned or offline</p>
              <button
                onClick={() => navigate('/vendor/workers/add')}
                className="px-4 py-2 rounded-lg font-semibold text-white text-sm"
                style={{
                  background: themeColors.button,
                  boxShadow: `0 2px 8px ${themeColors.button}40`,
                }}
              >
                Add Worker
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {workers.map((worker) => {
                const workerId = worker._id || worker.id;
                const isSelected = (selectedWorker?._id || selectedWorker?.id) === workerId;
                const status = worker.status || worker.availability || 'OFFLINE';

                return (
                  <button
                    key={workerId}
                    onClick={() => {
                      setSelectedWorker(worker);
                      setAssignToSelf(false);
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all ${isSelected
                      ? 'border-2'
                      : 'bg-white border border-gray-200'
                      }`}
                    style={
                      isSelected
                        ? {
                          borderColor: themeColors.button,
                          background: `${themeColors.button}10`,
                        }
                        : {
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-white' : 'bg-gray-100'
                          }`}
                        style={
                          isSelected
                            ? {
                              border: `3px solid ${themeColors.button}`,
                            }
                            : {}
                        }
                      >
                        {isSelected ? (
                          <FiCheck className="w-6 h-6" style={{ color: themeColors.button }} />
                        ) : (
                          <FiUser className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{worker.name}</h3>
                        <p className="text-sm text-gray-600">{worker.phone}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {worker.skills?.slice(0, 2).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded-lg text-xs font-medium"
                              style={{
                                background: `${themeColors.button}15`,
                                color: themeColors.button,
                              }}
                            >
                              {typeof skill === 'string' ? skill : skill.name || skill.title || 'Skill'}
                            </span>
                          ))}
                          {worker.skills?.length > 2 && (
                            <span className="text-xs text-gray-500">+{worker.skills.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Assign Button */}
        <div className="mt-8">
          <button
            onClick={handleAssign}
            disabled={(!assignToSelf && !selectedWorker) || assigning}
            className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: themeColors.button,
              boxShadow: `0 4px 12px ${themeColors.button}40`,
            }}
          >
            {assigning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Assigning...</span>
              </>
            ) : (
              <>
                <span>Assign</span>
                <FiArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default AssignWorker;

