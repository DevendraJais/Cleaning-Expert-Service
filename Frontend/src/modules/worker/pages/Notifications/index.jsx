import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiBriefcase, FiChevronRight, FiTrash2, FiX } from 'react-icons/fi';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import workerService from '../../../../services/workerService';
import { toast } from 'react-hot-toast';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await workerService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener('workerNotificationsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('workerNotificationsUpdated', handleUpdate);
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await workerService.markNotificationAsRead(id);
      if (response.success) {
        setNotifications(notifications.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await workerService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        toast.success('All marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const response = await workerService.deleteNotification(id);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success('Notification removed');
      }
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete');
    }
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    setShowClearConfirm(true);
  };

  const confirmClearAll = async () => {
    try {
      const response = await workerService.deleteAllNotifications();
      if (response.success) {
        setNotifications([]);
        toast.success('All notifications cleared');
      }
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Failed to clear', error);
      toast.error('Failed to clear');
      setShowClearConfirm(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    // Simple filter since actual notification types might vary
    if (filter === 'job') return notif.type?.toLowerCase().includes('job') || notif.type?.toLowerCase().includes('booking');
    if (filter === 'payment') return notif.type?.toLowerCase().includes('payment');
    return true;
  });

  const getNotificationIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('job') || t.includes('booking')) return <FiBriefcase className="w-5 h-5" />;
    if (t.includes('payment')) return <span className="text-lg font-bold">₹</span>;
    return <FiBell className="w-5 h-5" />;
  };

  const getNotificationColor = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('job') || t.includes('booking')) return '#3B82F6';
    if (t.includes('payment')) return '#10B981';
    return themeColors.button;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Notifications" />

      <main className="px-4 py-6">
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'job', label: 'Jobs' },
            { id: 'payment', label: 'Payments' },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${filter === filterOption.id
                ? 'text-white'
                : 'bg-white text-gray-600'
                }`}
              style={
                filter === filterOption.id
                  ? {
                    background: themeColors.button,
                    boxShadow: `0 2px 8px ${themeColors.button}40`,
                  }
                  : {
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  }
              }
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex justify-end gap-3 mb-4">
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors"
              >
                Mark Read
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
            >
              <FiTrash2 className="w-3 h-3" /> Clear All
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="flex justify-between items-start">
                      <div className="h-4 w-32 bg-slate-100 rounded"></div>
                      <div className="h-3 w-16 bg-slate-100 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-slate-100 rounded"></div>
                      <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">No notifications</h3>
            <p className="text-gray-500 text-sm max-w-xs">You'll see notifications here when you receive job assignments or payments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => {
              const iconColor = getNotificationColor(notif.type);
              const isUnread = !notif.isRead;

              return (
                <div
                  key={notif._id}
                  className={`relative overflow-hidden bg-white rounded-2xl transition-all duration-300 group ${isUnread ? 'shadow-md border-b-2' : 'shadow-sm opacity-90'}`}
                  style={{
                    borderColor: isUnread ? iconColor + '40' : '#F3F4F6',
                    transform: isUnread ? 'scale(1.01)' : 'scale(1)',
                  }}
                >
                  {/* Unread Indicator Bar */}
                  {isUnread && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5"
                      style={{ background: iconColor }}
                    />
                  )}

                  <div className={`p-4 ${isUnread ? 'pl-5' : 'pl-4'}`}>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{
                          background: isUnread ? iconColor : '#F3F4F6',
                          color: isUnread ? '#FFFFFF' : '#9CA3AF'
                        }}
                      >
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-base ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap font-medium">
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed mb-3 ${isUnread ? 'text-gray-600' : 'text-gray-500'}`}>
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          {(notif.relatedId && notif.relatedType === 'booking') ? (
                            <button
                              onClick={() => navigate(`/worker/job/${notif.relatedId}`)}
                              className="text-xs font-bold uppercase tracking-wide flex items-center gap-1 transition-colors hover:opacity-80"
                              style={{ color: iconColor }}
                            >
                              View Job <FiChevronRight className="w-3 h-3" />
                            </button>
                          ) : <div></div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Mark Read & Delete - Positioned absolute top-right */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {isUnread && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notif._id);
                        }}
                        className="p-1 rounded-full bg-gray-50 hover:bg-gray-100 text-green-600 transition-colors shadow-sm"
                        title="Mark as read"
                      >
                        <FiCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, notif._id)}
                      className="p-1 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                      title="Delete"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-scale-in">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <FiTrash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Clear All Notifications?</h3>
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className="py-3 rounded-xl font-bold text-white bg-red-500 shadow-lg shadow-red-500/30 active:scale-95 transition-all"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
