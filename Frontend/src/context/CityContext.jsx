import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const CityContext = createContext();

export const useCity = () => useContext(CityContext);

export const CityProvider = ({ children }) => {
  const [currentCity, setCurrentCity] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cities and restore selection on mount
  useEffect(() => {
    const initCity = async () => {
      try {
        setLoading(true);
        // Fetch active cities from public API
        const response = await api.get('/public/cities');

        if (response.data.success && response.data.cities.length > 0) {
          const fetchedCities = response.data.cities;
          setCities(fetchedCities);

          // Check if user has a saved city
          const savedCityId = localStorage.getItem('selectedCityId');
          let selected = null;

          if (savedCityId) {
            selected = fetchedCities.find(c => c._id === savedCityId || c.id === savedCityId);
          }

          // If no active saved city, fallback to default or first active
          if (!selected) {
            selected = fetchedCities.find(c => c.isDefault) || fetchedCities[0];
          }

          setCurrentCity(selected);
          if (selected) {
            localStorage.setItem('selectedCityId', selected._id || selected.id);
          }
        }
      } catch (error) {
        console.error('Failed to load cities:', error);
      } finally {
        setLoading(false);
      }
    };

    initCity();
  }, []);

  const selectCity = (city) => {
    setCurrentCity(city);
    if (city) {
      localStorage.setItem('selectedCityId', city._id || city.id);
    } else {
      localStorage.removeItem('selectedCityId');
    }
  };

  const value = {
    currentCity,
    cities,
    selectCity,
    loading
  };

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
};
