import { useEffect, useRef, useCallback } from 'react';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';

/**
 * useLocationTracking Hook
 * Watches GPS location and emits updates via socket AND Firebase for live tracking.
 * 
 * @param {Socket} socket - Socket.IO client instance
 * @param {string} bookingId - Current booking ID
 * @param {boolean} isActive - Whether tracking should be active (e.g., during journey)
 * @param {object} options - Configuration options
 */
export const useLocationTracking = (socket, bookingId, isActive, options = {}) => {
  const {
    distanceFilter = 10, // meters - only update if moved more than this
    interval = 3000,     // ms - minimum interval between emissions
    enableHighAccuracy = true
  } = options;

  const watchIdRef = useRef(null);
  const lastEmitTimeRef = useRef(0);
  const lastPositionRef = useRef(null);

  // Calculate distance between two points in meters
  const getDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Sync to Firebase Realtime Database
  const syncToFirebase = useCallback((lat, lng, heading) => {
    if (!db || !bookingId) return;
    try {
      const trackingRef = ref(db, `trackings/${bookingId}`);
      set(trackingRef, {
        lat,
        lng,
        heading: heading || 0,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('[Firebase Tracking] Error updating location:', error);
    }
  }, [bookingId]);

  // Emit location to socket
  const emitLocation = useCallback((position) => {
    if (!socket || !bookingId) return;

    const { latitude, longitude, heading } = position.coords;
    const now = Date.now();

    // Check time interval
    if (now - lastEmitTimeRef.current < interval) {
      return;
    }

    // Check distance filter
    if (lastPositionRef.current) {
      const dist = getDistance(
        lastPositionRef.current.lat,
        lastPositionRef.current.lng,
        latitude,
        longitude
      );
      if (dist < distanceFilter) {
        return;
      }
    }

    // 1. Emit to Socket.IO (for database storage and legacy support)
    socket.emit('update_location', {
      bookingId,
      lat: latitude,
      lng: longitude,
      heading: heading || 0
    });

    // 2. Sync to Firebase (for real-time high-performance tracking)
    syncToFirebase(latitude, longitude, heading);

    lastEmitTimeRef.current = now;
    lastPositionRef.current = { lat: latitude, lng: longitude };
  }, [socket, bookingId, interval, distanceFilter, getDistance, syncToFirebase]);

  // Start/stop watching position
  useEffect(() => {
    if (!isActive || !socket || !bookingId) {
      // Stop watching if not active
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Start watching position
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          emitLocation(position);
        },
        (error) => {
          console.warn('[useLocationTracking] GPS Error:', error.message);
        },
        {
          enableHighAccuracy,
          maximumAge: 5000, // Accept cached position up to 5 seconds old
          timeout: 10000
        }
      );
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isActive, socket, bookingId, emitLocation, enableHighAccuracy]);

  // Force emit current location (useful for initial position)
  const forceEmit = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (socket && bookingId) {
            const { latitude, longitude, heading } = position.coords;
            // 1. Socket
            socket.emit('update_location', {
              bookingId,
              lat: latitude,
              lng: longitude,
              heading: heading || 0
            });
            // 2. Firebase
            syncToFirebase(latitude, longitude, heading);
            
            lastPositionRef.current = { lat: latitude, lng: longitude };
          }
        },
        (error) => {
          console.warn('[useLocationTracking] Force emit error:', error.message);
        },
        { enableHighAccuracy, timeout: 5000 }
      );
    }
  }, [socket, bookingId, enableHighAccuracy, syncToFirebase]);

  return { forceEmit };
};

export default useLocationTracking;

