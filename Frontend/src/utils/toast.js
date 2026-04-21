// Toast utility - uses react-hot-toast
// Install: npm install react-hot-toast

let toast = null;

// Initialize toast function (called after react-hot-toast is loaded)
export const initToast = (toastFunction) => {
  toast = toastFunction;
};

// Toast helper functions
export const showToast = {
  success: (message) => {
    if (toast) {
      toast.success(message, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } else {
      // Fallback to alert if toast not initialized
      alert(message);
    }
  },
  
  error: (message) => {
    if (toast) {
      toast.error(message, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } else {
      // Fallback to alert if toast not initialized
      alert(message);
    }
  },
  
  info: (message) => {
    if (toast) {
      toast(message, {
        duration: 3000,
        position: 'top-center',
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } else {
      // Fallback to alert if toast not initialized
      alert(message);
    }
  },
  
  loading: (message) => {
    if (toast) {
      return toast.loading(message, {
        position: 'top-center',
        style: {
          background: '#6366f1',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    }
    return null;
  },
};

