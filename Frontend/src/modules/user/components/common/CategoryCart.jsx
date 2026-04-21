import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiX, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import BottomNav from '../layout/BottomNav';
import { cartService } from '../../../../services/cartService';
import OptimizedImage from '../../../../components/common/OptimizedImage';
import { useCart } from '../../../../context/CartContext';

const CategoryCart = ({
  isOpen,
  onClose,
  category,
  categoryTitle
}) => {
  const navigate = useNavigate();
  // Use global cart state
  const { cartItems, removeItem, updateItem, isLoading: loading } = useCart();

  // Filter items for this category from global cart
  const categoryItems = React.useMemo(() => {
    return cartItems.filter(item => item.category === category);
  }, [cartItems, category]);



  const handleClose = () => {
    onClose();
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await removeItem(itemId);
      if (response.success) {
        toast.success('Item removed from cart');
      } else {
        toast.error(response.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    try {
      const item = categoryItems.find(i => i._id === itemId || i.id === itemId);
      if (!item) return;

      const newCount = Math.max(1, (item.serviceCount || 1) + change);
      const response = await updateItem(itemId, newCount);

      if (!response.success) {
        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleCheckout = () => {
    navigate('/user/checkout', { state: { category: category } });
  };

  const handleCartClick = () => {
    // Already on category cart page
  };

  if (!isOpen) return null;

  // Calculate totals
  const totalPrice = categoryItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalOriginalPrice = categoryItems.reduce((sum, item) => {
    const unitOriginalPrice = item.originalPrice || (item.unitPrice || (item.price / (item.serviceCount || 1)));
    return sum + (unitOriginalPrice * (item.serviceCount || 1));
  }, 0);

  const cartCount = categoryItems.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-black" />
              </button>
              <h1 className="text-xl font-bold text-black">{categoryTitle || 'Cart'}</h1>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
        <div className="border-b border-gray-200"></div>
      </header>

      {/* Cart Items */}
      <main className="px-4 py-4" style={{ paddingBottom: categoryItems.length > 0 ? '160px' : '40px' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="w-16 h-16 text-gray-300 mb-4 animate-spin" />
            <p className="text-gray-500 text-lg font-medium">Loading cart...</p>
          </div>
        ) : categoryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-2">Add services to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categoryItems.map((item) => (
              <div
                key={item._id || item.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                style={{
                  boxShadow: themeColors.cardShadow,
                  border: themeColors.cardBorder,
                  padding: '16px'
                }}
              >
                <div className="flex gap-4 mb-4">
                  {/* Service Icon - Modern Card */}
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden leading-none self-start"
                    style={{
                      backgroundColor: 'rgba(0, 166, 166, 0.08)',
                      border: '2px solid rgba(0, 166, 166, 0.1)',
                      lineHeight: 0,
                      alignSelf: 'flex-start'
                    }}
                  >
                    {item.icon ? (
                      <OptimizedImage
                        src={item.icon}
                        alt={item.title}
                        className="w-14 h-14 object-contain"
                        height={56}
                        width={56}
                      />
                    ) : null}
                    <div
                      className={`flex items-center justify-center ${item.icon ? 'hidden' : 'flex'}`}
                      style={{
                        width: '56px',
                        height: '56px',
                        display: item.icon ? 'none' : 'flex'
                      }}
                    >
                      <FiShoppingCart className="w-8 h-8" style={{ color: themeColors.button }} />
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Delete Button */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-black leading-tight flex-1">{item.title}</h3>
                      <button
                        onClick={() => handleDelete(item._id || item.id)}
                        className="p-1.5 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Control and Price - Outside flex container */}
                <div className="flex items-center justify-between mb-4">
                  {/* Quantity Control */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-gray-600 font-medium">Quantity:</span>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityChange(item._id || item.id, -1)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <FiMinus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="text-sm font-bold text-black min-w-[24px] text-center">
                        {item.serviceCount || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item._id || item.id, 1)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <FiPlus className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-lg font-bold text-black">
                      ₹{(item.price || 0).toLocaleString('en-IN')}
                    </span>
                    {(() => {
                      const unitPrice = item.unitPrice || (item.price / (item.serviceCount || 1));
                      const unitOriginalPrice = item.originalPrice || unitPrice;
                      const currentTotal = item.price;
                      const originalTotal = unitOriginalPrice * (item.serviceCount || 1);

                      if (originalTotal > currentTotal) {
                        return (
                          <div className="text-xs text-gray-400 line-through">
                            ₹{originalTotal.toLocaleString('en-IN')}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary - Fixed at bottom if items exist */}
        {categoryItems.length > 0 && (
          <div
            className="fixed left-0 right-0 z-[9997] px-4 pt-4 pb-6 border-t border-gray-200"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
              bottom: '0',
              position: 'fixed',
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px'
            }}
          >
            <div className="max-w-screen-xl mx-auto">
              <div className="mb-4 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                  <span className="text-lg font-bold text-black">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                {totalOriginalPrice > totalPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 line-through">Original Price</span>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{totalOriginalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-xl text-base font-bold text-white transition-all active:scale-98 shadow-lg"
                style={{
                  backgroundColor: themeColors.button,
                  boxShadow: '0 4px 12px rgba(0, 166, 166, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = themeColors.button;
                  e.target.style.boxShadow = '0 6px 16px rgba(0, 166, 166, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = themeColors.button;
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 166, 166, 0.4)';
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>

      {/* BottomNav removed as per request */}
    </div>
  );
};

export default CategoryCart;
