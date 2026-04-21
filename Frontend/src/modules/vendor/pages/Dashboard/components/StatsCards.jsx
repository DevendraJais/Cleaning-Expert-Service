import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiBriefcase, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { vendorTheme as themeColors } from '../../../../../theme';

const StatsCards = memo(({ stats }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Today's Earnings",
      value: `₹${stats.todayEarnings.toLocaleString()}`,
      icon: FaWallet,
      gradient: 'linear-gradient(135deg, #001947 0%, #003b77 100%)',
      onClick: () => navigate('/vendor/wallet')
    },
    {
      title: 'Pending Alerts',
      value: stats.pendingAlerts,
      icon: FiClock,
      gradient: 'linear-gradient(135deg, #406788 0%, #304a63 100%)',
      onClick: () => navigate('/vendor/booking-alerts')
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: FiBriefcase,
      gradient: 'linear-gradient(135deg, #406788 0%, #304a63 100%)',
      onClick: () => navigate('/vendor/jobs')
    },
    {
      title: 'Completed',
      value: stats.completedJobs,
      icon: FiCheckCircle,
      gradient: 'linear-gradient(135deg, #001947 0%, #003b77 100%)',
      onClick: () => navigate('/vendor/jobs')
    }
  ];

  return (
    <div className="px-4 pt-4">
      <div className="grid grid-cols-2 gap-3 mb-4">
        {cards.map((card, index) => {
          const IconComponent = card.icon;

          return (
            <div
              key={index}
              onClick={card.onClick}
              className="rounded-xl p-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
              style={{
                background: card.gradient,
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
                    <p className="text-xs text-white font-semibold mb-1 opacity-90 uppercase tracking-wide">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-white leading-tight">
                      {card.value}
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
                    <IconComponent className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

StatsCards.displayName = 'VendorStatsCards';

export default StatsCards;
