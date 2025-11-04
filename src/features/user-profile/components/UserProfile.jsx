import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserName, updateUserAvatar, getAvatarOptions } from '../../../shared/utils/userProfile.js';
import { clearAllHighScores } from '../../high-scores/utils/highScores';
import HighScores from '../../high-scores/components/HighScores';
import '../styles/UserProfile.css';

const UserProfile = ({ onClose, gameType = 'sudoku', onProfileUpdate }) => {
  const [profile, setProfile] = useState(getUserProfile());
  const [isEditing, setIsEditing] = useState(!profile.name);
  const [tempName, setTempName] = useState(profile.name);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);

  useEffect(() => {
    // If user doesn't have a name, show editing mode
    if (!profile.name) {
      setIsEditing(true);
    }
  }, [profile.name]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      const updatedProfile = updateUserName(tempName.trim());
      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
        // Notify parent component that profile was updated
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      }
    }
  };

  const handleAvatarSelect = (avatar) => {
    const updatedProfile = updateUserAvatar(avatar);
    if (updatedProfile) {
      setProfile(updatedProfile);
      setShowAvatarPicker(false);
      // Notify parent component that profile was updated
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    }
  };

  const handleClose = () => {
    // Make sure header gets updated with latest profile info
    if (onProfileUpdate) {
      onProfileUpdate();
    }
    onClose();
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear ALL high scores and game data? This cannot be undone.')) {
      clearAllHighScores();
      alert('All high scores data has been cleared! Refresh the page to see changes.');
    }
  };

  if (showHighScores) {
    return (
      <HighScores 
        gameType={gameType} 
        onClose={() => setShowHighScores(false)} 
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal user-profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Player Profile</h2>
          <button className="user-profile-close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="profile-content">
          {/* Avatar Section */}
          <div className="avatar-section">
            <button 
              className="avatar-button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              title="Change Avatar"
            >
              <span className="avatar-display">{profile.avatar}</span>
            </button>
            
            {showAvatarPicker && (
              <div className="avatar-picker">
                <h4>Choose an Avatar</h4>
                <div className="avatar-grid">
                  {getAvatarOptions().map(avatar => (
                    <button
                      key={avatar}
                      className={`avatar-option ${profile.avatar === avatar ? 'selected' : ''}`}
                      onClick={() => handleAvatarSelect(avatar)}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Name Section */}
          <div className="name-section">
            {isEditing ? (
              <div className="name-input-section">
                <label htmlFor="player-name">What should we call you?</label>
                <input
                  id="player-name"
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your name..."
                  maxLength={20}
                  autoFocus
                />
                <div className="name-buttons">
                  <button 
                    className="save-btn"
                    onClick={handleSaveName}
                    disabled={!tempName.trim()}
                  >
                    Save
                  </button>
                  {profile.name && (
                    <button 
                      className="cancel-btn"
                      onClick={() => {
                        setTempName(profile.name);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="name-display-section">
                <h3>Hello, {profile.name}!</h3>
                <button 
                  className="edit-name-btn"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Name
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button 
              className="action-btn primary"
              onClick={() => setShowHighScores(true)}
            >
              🏆 View High Scores
            </button>
            
            <button 
              className="action-btn"
              onClick={handleClose}
            >
              🎮 Continue Playing
            </button>
          </div>

          {/* Profile Info */}
          {profile.joinDate && (
            <div className="profile-info">
              <p>Playing since: {new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;