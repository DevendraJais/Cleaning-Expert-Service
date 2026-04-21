import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiUser, FiBriefcase, FiCalendar, FiMessageSquare, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import bookingService from '../../../../services/bookingService';

const MyRating = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchRatings = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await bookingService.getRatings({ page, limit: 10 });
      if (response.success) {
        setRatings(page === 1 ? response.data : [...ratings, ...response.data]);
        setPagination(response.pagination);
      } else {
        toast.error(response.message || 'Failed to fetch ratings');
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load ratings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-black text-black">My Reviews</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {isLoading && pagination.page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Fetching your reviews...</p>
          </div>
        ) : ratings.length > 0 ? (
          <div className="space-y-4">
            {ratings.map((rating, idx) => (
              <div
                key={rating._id || idx}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100/50">
                      {rating.vendorId?.profilePhoto ? (
                        <img src={rating.vendorId.profilePhoto} alt={rating.vendorId.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900">{rating.vendorId?.businessName || rating.vendorId?.name || 'Service Provider'}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar
                              key={s}
                              className={`w-3 h-3 ${s <= rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(rating.reviewedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <span className="text-[10px] font-black text-blue-600 uppercase">{rating.serviceName || rating.serviceId?.title}</span>
                  </div>
                </div>

                {rating.review && (
                  <p className="text-gray-600 text-sm leading-relaxed font-medium pl-2 border-l-4 border-blue-500/20">
                    "{rating.review}"
                  </p>
                )}

                {rating.reviewImages && rating.reviewImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {rating.reviewImages.map((img, i) => (
                      <img key={i} src={img} className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-100" alt="Review" />
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiBriefcase className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500">Booking #{rating.bookingNumber}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/user/booking/${rating._id}`)}
                    className="text-[11px] font-black text-blue-600 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}

            {/* Load More */}
            {pagination.total > ratings.length && (
              <button
                onClick={() => fetchRatings(pagination.page + 1)}
                className="w-full py-4 bg-white rounded-2xl border-2 border-gray-100 text-gray-600 font-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                {isLoading ? <FiLoader className="animate-spin" /> : 'Load More Reviews'}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] p-8 text-center shadow-md border border-dashed border-gray-200 py-16">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6 mx-auto">
              <FiStar className="w-12 h-12 text-gray-200" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 text-sm font-medium">
              You haven't reviewed any services yet. After completing a booking, you can rate your experience!
            </p>
            <button
              onClick={() => navigate('/user/bookings')}
              className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              Go to My Bookings
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRating;
