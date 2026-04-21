// Location Permission Checker Component for Homestr
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import flutterBridge from '../../utils/flutterBridge';

export const LocationPermissionChecker = () => {
    useEffect(() => {
        const checkPermission = async (isManualTrigger = false) => {
            const hasGrantedPreviously = localStorage.getItem('location_granted') === 'true';

            // If manual trigger (user clicked something), we try to get location
            if (isManualTrigger) {
                try {
                    const location = await flutterBridge.getCurrentLocation();
                    localStorage.setItem('location_granted', 'true');
                    window.dispatchEvent(new CustomEvent('locationUpdate', { detail: location }));
                } catch (err) {
                    toast.error("Please enable your location to use this feature.");
                }
                return;
            }

            // 1. Silent check via Unified Bridge
            try {
                const location = await flutterBridge.getCurrentLocation();
                localStorage.setItem('location_granted', 'true');
            } catch (err) {
                if (!hasGrantedPreviously || err.code === 1 || err.code === 2) {
                    // Just show a toast once on mount if we can't get location
                    toast("Please turn on your location for accurate services.", { icon: '📍' });
                }
            }
        };

        // Delay execution to ensure Flutter WebView is fully ready
        const timer = setTimeout(() => {
            checkPermission(false);
        }, 1500);

        // Global listener for manual triggers
        const handleManualTrigger = () => {
            console.log('Manual location trigger received');
            checkPermission(true);
        };
        window.addEventListener('requestLocationPrompt', handleManualTrigger);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('requestLocationPrompt', handleManualTrigger);
        };
    }, []);

    return null;
};
