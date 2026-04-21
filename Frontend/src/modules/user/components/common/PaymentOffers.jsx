import React, { memo } from 'react';
import { MdLocalOffer } from 'react-icons/md';
import { themeColors } from '../../../../theme';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const PaymentOffers = memo(({ offers = [] }) => {
  // Format offers to ensure consistent structure
  const formatOffers = (rawOffers) => {
    if (!rawOffers || rawOffers.length === 0) {
      return [
        {
          id: 1,
          title: 'Mobikwik cashback up to ₹...',
          subtitle: 'Via Mobikwik UPI Payment',
        },
        {
          id: 2,
          title: '₹100 back - order',
          subtitle: 'Via Airtel Payment',
        },
      ];
    }

    return rawOffers.map((offer, index) => {
      // If it's already in the correct format (title, subtitle)
      if (offer.subtitle) {
        return {
          id: offer.id || index + 1,
          title: offer.title,
          subtitle: offer.subtitle,
          iconUrl: offer.iconUrl
        };
      }

      // If it's from service data (title, discount, code, description)
      return {
        id: offer._id || index + 1,
        title: offer.discount ? `${offer.title} - ${offer.discount}` : offer.title,
        subtitle: offer.code ? `Use code: ${offer.code}` : (offer.description || ''),
        iconUrl: offer.iconUrl
      };
    });
  };

  const formattedOffers = formatOffers(offers);

  return (
    <div className="px-4 mb-6">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {formattedOffers.map((offer) => (
          <div
            key={offer.id}
            className="min-w-[240px] bg-white rounded-2xl p-3 flex items-center gap-3 shrink-0"
            style={{
              boxShadow: themeColors.cardShadow,
              border: themeColors.cardBorder
            }}
          >
            {offer.iconUrl ? (
              <img
                src={toAssetUrl(offer.iconUrl)}
                alt=""
                className="w-8 h-8 rounded-full border border-gray-100 object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <MdLocalOffer className="w-4 h-4 text-green-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 mb-0.5 truncate">
                {offer.title}
              </p>
              <p className="text-xs text-gray-500 truncate">{offer.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

PaymentOffers.displayName = 'PaymentOffers';

export default PaymentOffers;

