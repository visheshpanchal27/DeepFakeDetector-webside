import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      analysis: true,
      security: false
    },
    privacy: {
      shareAnalytics: false,
      publicProfile: false
    },
    analysis: {
      autoSave: true,
      defaultConfidenceThreshold: 70,
      maxFileSize: 500
    }
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('deepfake_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (category, setting, value) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: value
        }
      };
      localStorage.setItem('deepfake_settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};