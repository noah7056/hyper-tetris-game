import React from 'react';
import { TetrominoType } from '../types';
import { TETROMINOS } from '../constants';

interface Props {
  type: TetrominoType | 0;
  isClearing?: boolean;
  hue?: number;
  saturate?: number;
  brightness?: number;
  sepia?: number;
  isGhost?: boolean;
}

const TetrisCell: React.FC<Props> = ({ 
  type, 
  isClearing, 
  hue = 0, 
  saturate = 100, 
  brightness = 100,
  sepia = 0,
  isGhost = false
}) => {
  const color = type ? TETROMINOS[type].color : '0, 0, 0';
  const isFilled = type !== 0;

  // If it's a ghost piece, we want just the border and some transparency
  const ghostStyle = isGhost ? {
    backgroundColor: `rgba(${color}, 0.2)`,
    border: `2px solid rgba(${color}, 0.5)`,
    filter: `sepia(${sepia}) hue-rotate(${hue}deg) saturate(${saturate}%) brightness(${brightness}%)`
  } : {};

  const normalStyle = {
    backgroundColor: isFilled ? `rgba(${color}, 1)` : 'rgba(0,0,0,0.5)',
    borderTop: isFilled ? `2px solid rgba(255,255,255,0.3)` : 'none',
    borderLeft: isFilled ? `2px solid rgba(255,255,255,0.3)` : 'none',
    borderRight: isFilled ? `2px solid rgba(0,0,0,0.3)` : 'none',
    borderBottom: isFilled ? `2px solid rgba(0,0,0,0.3)` : 'none',
    // Apply sepia first to unify colors if needed, then rotate hue, then adjust sat/bright
    filter: isFilled ? `sepia(${sepia}) hue-rotate(${hue}deg) saturate(${saturate}%) brightness(${brightness}%)` : 'none',
  };

  return (
    <div
      className={`w-full h-full border-b border-r border-white/10 relative box-border
      ${isFilled && !isGhost ? 'shadow-[inset_0px_0px_10px_rgba(0,0,0,0.2)]' : ''}
      ${isClearing ? 'animate-flash' : ''}
      `}
      style={isGhost ? ghostStyle : normalStyle}
    />
  );
};

export default React.memo(TetrisCell);