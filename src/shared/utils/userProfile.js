// User profile management using localStorage

const STORAGE_KEY = 'puzzle_user_profile';

// Default user profile
const DEFAULT_PROFILE = {
  name: '',
  avatar: '👤',
  joinDate: new Date().toISOString(),
  preferences: {
    theme: 'auto',
    notifications: true,
    autoSave: true
  }
};

// Get user profile
export const getUserProfile = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
    }
    return DEFAULT_PROFILE;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return DEFAULT_PROFILE;
  }
};

// Save user profile
export const saveUserProfile = (profile) => {
  try {
    const updatedProfile = {
      ...getUserProfile(),
      ...profile,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    return updatedProfile;
  } catch (error) {
    console.error('Failed to save user profile:', error);
    return false;
  }
};

// Update user name
export const updateUserName = (name) => {
  return saveUserProfile({ name: name.trim() });
};

// Update user avatar
export const updateUserAvatar = (avatar) => {
  return saveUserProfile({ avatar });
};

// Check if user has set up their profile
export const isProfileSetup = () => {
  const profile = getUserProfile();
  return profile.name && profile.name.length > 0;
};

// Get user display name (fallback to "Player" if not set)
export const getUserDisplayName = () => {
  const profile = getUserProfile();
  return profile.name || 'Player';
};

// Get available avatar options
export const getAvatarOptions = () => {
  return [
    '👤', '😊', '😎', '🧠', '🎯', '🏆', '⭐', '🎮',
    '🔥', '💎', '🚀', '🎨', '🎪', '🎭', '🎸', '⚡',
    '🌟', '🎊', '🎉', '🦄', '🐱', '🐶', '🦊', '🐼'
  ];
};

// Clear user profile (for testing)
export const clearUserProfile = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear user profile:', error);
    return false;
  }
};