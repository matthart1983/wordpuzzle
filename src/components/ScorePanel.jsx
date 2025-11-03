import React from 'react';
import './ScorePanel.css';

const ScorePanel = ({ 
  currentPoints, 
  totalPossible, 
  currentRank, 
  nextRankProgress, 
  foundWords 
}) => {
  const percentage = totalPossible > 0 ? Math.round((currentPoints / totalPossible) * 100) : 0;
  
  return (
    <div className="score-panel">
      <div className="score-header">
        <div className="points-display">
          <span className="current-points">{currentPoints}</span>
          <span className="max-points">/ {totalPossible}</span>
        </div>
        <div className="percentage">{percentage}%</div>
      </div>
      
      <div className="rank-section">
        <div className="current-rank">
          <span className="rank-label">Rank:</span>
          <span className="rank-name">{currentRank.name}</span>
        </div>
        
        {nextRankProgress.nextRank && (
          <div className="next-rank">
            <div className="next-rank-info">
              <span>Next: {nextRankProgress.nextRank.name}</span>
              <span>({nextRankProgress.pointsNeeded} points needed)</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${nextRankProgress.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="words-found">
        <div className="words-count">
          Words found: {foundWords.length}
        </div>
      </div>
    </div>
  );
};

export default ScorePanel;