import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';

const CartIcon = ({ itemCount = 0, onClick }) => {
  return (
    <div 
      className="relative cursor-pointer"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <FiShoppingCart className="w-6 h-6 text-black" />
      </div>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </div>
  );
};

export default CartIcon;

