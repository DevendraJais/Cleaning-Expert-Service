import React, { useState, useEffect } from 'react';
import { FiX, FiDollarSign, FiCamera, FiCheck, FiInfo, FiTrash, FiCreditCard } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { vendorTheme as themeColors } from '../../../../theme';
import { toast } from 'react-hot-toast';

const WorkerPaymentModal = ({ isOpen, onClose, workerName, amountDue = 0, onConfirm, loading }) => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('hand_to_hand'); // Default as per request
  const [screenshot, setScreenshot] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setTransactionId('');
      setNotes('');
      setPaymentMethod('hand_to_hand');
      setScreenshot(null);
    }
  }, [isOpen]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Process payment recording
    onConfirm({
      amount: parseFloat(amount),
      notes,
      transactionId,
      screenshot,
      paymentMethod
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">Worker Payout</h3>
                <p className="text-xs text-green-600 font-bold uppercase tracking-wider mt-1">Record Payment</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 active:scale-95"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Worker Info */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-green-600 shadow-sm">
                  <FiDollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paying To</p>
                  <p className="text-base font-bold text-gray-800">{workerName || 'Assigned Worker'}</p>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Payout Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-bold text-xl"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Payment Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('hand_to_hand')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${paymentMethod === 'hand_to_hand'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                  >
                    Hand to Hand (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${paymentMethod === 'online'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                  >
                    Online / Transfer
                  </button>
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  {paymentMethod === 'hand_to_hand' ? 'Reference (Optional)' : 'Transaction ID'}
                </label>
                <div className="relative">
                  <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder={paymentMethod === 'hand_to_hand' ? "e.g. Paid in cash" : "Enter trans ID"}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Payment Screenshot</label>
                {screenshot ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 group">
                    <img src={screenshot} alt="Payment Proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="p-3 bg-red-500 text-white rounded-full shadow-lg active:scale-90 transition-transform"
                      >
                        <FiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="w-full h-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-100 hover:border-green-500/50 transition-all group">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    <FiCamera className={`w-6 h-6 ${isUploading ? 'animate-bounce text-green-500' : 'text-gray-400 group-hover:text-green-500'}`} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-green-600">
                      {isUploading ? 'Uploading...' : 'Click to Upload'}
                    </span>
                  </label>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Payment Details / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any extra details about the payment..."
                  rows="2"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-4 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isUploading}
                  className="py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {loading ? 'Recording...' : 'Pay & Complete'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WorkerPaymentModal;
