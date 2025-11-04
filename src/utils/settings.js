/**
 * Settings management utility
 * Provides consistent settings across all games
 */

// Default settings configuration
const DEFAULT_SETTINGS = {
  darkMode: false,
  highContrast: false,
  colorBlindMode: false
};

// Storage key for settings
const SETTINGS_KEY = 'wordle-game-settings';

/**
 * Get current user settings
 * @returns {object} Current settings object
 */
export const getSettings = () => {
  try {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  return { ...DEFAULT_SETTINGS };
};

/**
 * Update user settings
 * @param {object} newSettings - Updated settings object
 * @returns {object} Updated settings
 */
export const updateSettings = (newSettings) => {
  try {
    const settings = { ...getSettings(), ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    
    // Apply theme classes to document root
    applyThemeSettings(settings);
    
    return settings;
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
    return getSettings();
  }
};

/**
 * Apply theme settings to document root
 * @param {object} settings - Settings object
 */
export const applyThemeSettings = (settings) => {
  const root = document.documentElement;
  
  // Remove all existing theme classes
  root.classList.remove('dark-theme', 'high-contrast', 'color-blind');
  
  // Apply new theme classes based on settings
  if (settings.darkMode) {
    root.classList.add('dark-theme');
  }
  if (settings.highContrast) {
    root.classList.add('high-contrast');
  }
  if (settings.colorBlindMode) {
    root.classList.add('color-blind');
  }
};

/**
 * Initialize settings on app load
 */
export const initializeSettings = () => {
  const settings = getSettings();
  applyThemeSettings(settings);
  return settings;
};

/**
 * Reset settings to default
 * @returns {object} Default settings
 */
export const resetSettings = () => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    const defaultSettings = { ...DEFAULT_SETTINGS };
    applyThemeSettings(defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.warn('Failed to reset settings:', error);
    return DEFAULT_SETTINGS;
  }
};