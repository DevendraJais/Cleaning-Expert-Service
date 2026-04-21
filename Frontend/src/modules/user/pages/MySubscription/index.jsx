import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFileText, FiX } from 'react-icons/fi';

const MySubscription = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-4">
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
            <h1 className="text-xl font-bold text-black">My subscription</h1>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
              <FiFileText className="w-12 h-12 text-gray-300" />
            </div>
            {/* Red X Circle Overlay */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
              <FiX className="w-4 h-4 text-white" />
            </div>
          </div>
          
          {/* Message */}
          <p className="text-base font-medium text-black">No subscription found</p>
        </div>
      </main>
    </div>
  );
};

export default MySubscription;

