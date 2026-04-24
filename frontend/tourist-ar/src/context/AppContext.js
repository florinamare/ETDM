import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUILDINGS } from '../constants/buildings';
import { getBuildings } from '../services/api';

const AppContext = createContext(null);

const DISCOVERED_KEY = 'etdm_discovered_v1';
const ONBOARDED_KEY = 'etdm_onboarded_v1';

export function AppProvider({ children }) {
  const [buildings, setBuildings] = useState(BUILDINGS);
  const [discovered, setDiscovered] = useState([]);
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(null); // null = loading

  useEffect(() => {
    AsyncStorage.multiGet([DISCOVERED_KEY, ONBOARDED_KEY]).then(([[, disc], [, onb]]) => {
      if (disc) setDiscovered(JSON.parse(disc));
      setHasOnboarded(onb === 'true');
    });

    getBuildings()
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) setBuildings(res.data);
      })
      .catch(() => {});
  }, []);

  const addDiscovered = (id) => {
    setDiscovered(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      AsyncStorage.setItem(DISCOVERED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markOnboarded = () => {
    setHasOnboarded(true);
    AsyncStorage.setItem(ONBOARDED_KEY, 'true');
  };

  return (
    <AppContext.Provider
      value={{
        buildings,
        discovered,
        activeBuilding,
        setActiveBuilding,
        addDiscovered,
        hasOnboarded,
        markOnboarded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
