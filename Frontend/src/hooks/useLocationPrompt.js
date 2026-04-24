import { useCallback } from 'react';

/**
 * Hook to trigger the Global Location Modal from any component
 */
export const useLocationPrompt = () => {
  const trigger = useCallback(() => {
    window.dispatchEvent(new CustomEvent('requestLocationPrompt'));
  }, []);

  const requestLocation = useCallback((callback) => {
    const handleUpdate = (e) => {
      window.removeEventListener('locationUpdate', handleUpdate);
      if (callback) callback(e.detail);
    };

    window.addEventListener('locationUpdate', handleUpdate, { once: true });
    trigger();
  }, [trigger]);

  return { trigger, requestLocation };
};

