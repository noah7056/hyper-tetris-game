import React from 'react';
import { BoardShape, TetrominoShape, TetrominoType } from '../types';
import TetrisCell from './TetrisCell';

interface Props {
  stage: BoardShape;
  clearedRowsIndices: number[];
  isTetris: boolean;
  hue: number;
  saturate: number;
  brightness: number;
  sepia?: number;
  // Ghost props
  showGhost?: boolean;
  ghostY?: number;
  playerPos?: { x: number, y: number };
  playerShape?: TetrominoShape;
  playerType?: TetrominoType;
  // Grid prop
  showGrid?: boolean;
}

const TetrisBoard: React.FC<Props> = ({ 
  stage, 
  clearedRowsIndices, 
  isTetris, 
  hue, 
  saturate, 
  brightness, 
  sepia = 0,
  showGhost = true,
  ghostY,
  playerPos,
  playerShape,
  playerType,
  showGrid = true
}) => {
  
  // Helper to check if a cell is part of the ghost
  const isGhostCell = (x: number, y: number) => {
    if (!showGhost || !playerPos || !playerShape || !playerType || ghostY === undefined) return false;
    
    const relativeY = y - ghostY;
    const relativeX = x - playerPos.x;

    if (relativeY >= 0 && relativeY < playerShape.length &&
        relativeX >= 0 && relativeX < playerShape[0].length) {
      return playerShape[relativeY][relativeX] !== 0;
    }
    return false;
  };

  return (
    <div className={`relative grid grid-rows-[repeat(20,minmax(0,1fr))] grid-cols-[repeat(10,minmax(0,1fr))] 
      ${showGrid ? 'gap-[1px]' : 'gap-0'} 
      bg-slate-900/80 border-4 border-slate-700 rounded-md overflow-hidden
      w-[80vw] max-w-[300px] h-[calc(80vw*2)] max-h-[600px] shadow-2xl backdrop-blur-sm
      ${isTetris ? 'animate-shake' : ''}
      transition-colors duration-1000
      `}>
      
      {stage.map((row, y) =>
        row.map((cell, x) => {
          // If the cell is empty (0) check if we should render a ghost
          const isGhost = cell[0] === 0 && isGhostCell(x, y);
          const type = isGhost && playerType ? playerType : cell[0];

          return (
            <TetrisCell 
              key={`${y}-${x}`} 
              type={type} 
              isClearing={clearedRowsIndices.includes(y)}
              hue={hue}
              saturate={saturate}
              brightness={brightness}
              sepia={sepia}
              isGhost={isGhost}
            />
          );
        })
      )}
      
      {isTetris && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            text-4xl font-bold text-yellow-400 font-retro animate-bounce z-20 tetris-text-shadow whitespace-nowrap pointer-events-none">
          TETRIS!
        </div>
      )}
    </div>
  );
};

export default TetrisBoard;