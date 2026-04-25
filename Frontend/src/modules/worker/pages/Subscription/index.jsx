import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { FiCheck, FiClock, FiShield, FiZap, FiArrowLeft, FiStar } from 'react-icons/fi';

const FEATURE_ICONS = ['🔔', '📍', '💰', '⚡', '🛡️', '🌟'];

const Subscription = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, statusRes] = await Promise.all([
        api.get('/workers/subscription/plans'),
        api.get('/workers/subscription/status')
      ]);
      if (plansRes.data.success) setPlans(plansRes.data.data);
      if (statusRes.data.success) setStatus(statusRes.data.data);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast.error('Could not load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (plan) => {
    setActivating(plan._id);
    try {
      const res = await api.post('/workers/subscription/activate', { planId: plan._id });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchData(); // Refresh status
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Activation failed');
    } finally {
      setActivating(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const daysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const diff = new Date(expiryDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-white font-bold text-xl">Worker Subscription</h1>
          <p className="text-white/60 text-sm">Get unlimited job alerts</p>
        </div>
      </div>

      {/* Active Status Card */}
      {status?.isActive ? (
        <div className="mx-4 mb-6 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <FiShield className="text-white w-5 h-5" />
              <span className="text-white font-bold text-sm uppercase tracking-wider">Active Plan</span>
            </div>
            <p className="text-white text-2xl font-black mb-1">{status.planName}</p>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <FiClock className="w-4 h-4" />
              <span>
                {daysRemaining(status.expiryDate)} days left · Expires {formatDate(status.expiryDate)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${Math.min(100, (daysRemaining(status.expiryDate) / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-4 mb-6 rounded-2xl p-4 border border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-amber-400 font-bold text-sm">No Active Subscription</p>
              <p className="text-white/60 text-xs">You won't receive job alerts until you subscribe</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="px-4 pb-6">
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Available Plans</p>

        <div className="space-y-4">
          {plans.map((plan, idx) => {
            const isPopular = idx === 1 && plans.length > 1;
            const isActivating = activating === plan._id;

            return (
              <div
                key={plan._id}
                className="rounded-2xl overflow-hidden border transition-all"
                style={{
                  borderColor: isPopular ? '#6c63ff' : 'rgba(255,255,255,0.1)',
                  background: isPopular
                    ? 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(108,99,255,0.05))'
                    : 'rgba(255,255,255,0.05)'
                }}
              >
                {isPopular && (
                  <div className="text-center py-1.5 text-xs font-black tracking-widest text-white"
                    style={{ background: 'linear-gradient(90deg, #6c63ff, #a855f7)' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-black text-lg">{plan.title}</h3>
                      <p className="text-white/50 text-sm mt-0.5">{plan.durationDays} days validity</p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-black text-3xl">₹{plan.price}</div>
                      <div className="text-white/40 text-xs">one time</div>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-white/60 text-sm mb-4">{plan.description}</p>
                  )}

                  {/* Default benefits */}
                  <div className="space-y-2 mb-5">
                    {[
                      'Receive unlimited job alerts',
                      'Direct customer contact',
                      `Valid for ${plan.durationDays} days`
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <FiCheck className="text-green-400 w-3 h-3" />
                        </div>
                        {benefit}
                      </div>
                    ))}

                    {/* Custom features from admin */}
                    {plan.features?.map((feat, i) => (
                      <div key={`f-${i}`} className="flex items-center gap-2 text-sm text-white/80">
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <FiZap className="text-purple-400 w-3 h-3" />
                        </div>
                        {feat}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleActivate(plan)}
                    disabled={isActivating}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
                    style={{
                      background: isPopular
                        ? 'linear-gradient(135deg, #6c63ff, #a855f7)'
                        : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: isPopular ? 'none' : '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    {isActivating ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Activating...
                      </span>
                    ) : status?.isActive ? `Extend with ${plan.title}` : `Subscribe – ₹${plan.price}`}
                  </button>
                </div>
              </div>
            );
          })}

          {plans.length === 0 && (
            <div className="text-center py-16 text-white/40">
              <FiStar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No plans available right now</p>
              <p className="text-sm mt-1">Please check back later</p>
            </div>
          )}
        </div>

        {/* Info footer */}
        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-white/50 text-xs text-center leading-relaxed">
            💡 Subscription activates immediately after payment. You can extend anytime — time gets added on top of your current plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
