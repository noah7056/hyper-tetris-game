import React from 'react';
import { Tetromino } from '../types';
import TetrisCell from './TetrisCell';

interface Props {
  tetromino: Tetromino;
  hue: number;
  saturate: number;
  brightness: number;
  sepia: number;
}

const NextPiece: React.FC<Props> = ({ tetromino, hue, saturate, brightness, sepia }) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
        <div 
          className="grid gap-[1px] bg-slate-900/30 p-2 rounded border border-white/5"
          style={{ 
              gridTemplateColumns: `repeat(${tetromino.shape[0].length}, minmax(0, 1fr))` 
          }}
        >
          {tetromino.shape.map((row, y) =>
            row.map((cell, x) => (
              <div key={`${y}-${x}`} className="w-5 h-5 md:w-6 md:h-6">
                 <TetrisCell 
                    type={cell} 
                    hue={hue} 
                    saturate={saturate} 
                    brightness={brightness} 
                    sepia={sepia} 
                 />
              </div>
            ))
          )}
        </div>
    </div>
  );
};

export default React.memo(NextPiece);
