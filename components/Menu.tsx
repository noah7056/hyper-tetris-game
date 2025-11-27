import React, { useState } from 'react';
import { Play, Pause, X, Settings, Trophy, Save, RotateCw } from 'lucide-react';
import { HighScore } from '../types';

interface Props {
  gameState: 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
  onStart: () => void;
  onResume: () => void;
  onQuit: () => void;
  onOpenOptions: () => void;
  score: number;
  highScores: HighScore[];
  isNewHighScore: boolean;
  onSubmitHighScore: (name: string) => void;
}

const Menu: React.FC<Props> = ({ 
  gameState, 
  onStart, 
  onResume, 
  onQuit, 
  onOpenOptions, 
  score,
  highScores,
  isNewHighScore,
  onSubmitHighScore
}) => {
  const [tempName, setTempName] = useState('');

  if (gameState === 'PLAYING') return null;

  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4 backdrop-blur-sm rounded-xl overflow-y-auto cursor-default">
      
      {/* Hyper Logo */}
      <div className="relative mb-8 text-center animate-pulse">
        <h1 className="text-4xl md:text-6xl font-retro text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 hyper-text-shadow italic transform -skew-x-12">
          HYPER
        </h1>
        <h1 className="text-4xl md:text-6xl font-retro text-white hyper-text-shadow -mt-2 md:-mt-4">
          TETRIS
        </h1>
      </div>
      
      {gameState === 'GAME_OVER' && !isNewHighScore && (
        <div className="text-center mb-6 animate-bounce">
          <p className="text-red-500 font-retro text-xl mb-2">GAME OVER</p>
          <p className="text-white font-mono text-lg">Score: {score}</p>
        </div>
      )}

      {gameState === 'PAUSED' && (
        <div className="text-center mb-6">
          <p className="text-yellow-400 font-retro text-xl">PAUSED</p>
        </div>
      )}

      {isNewHighScore ? (
         <div className="bg-slate-800 p-6 rounded-lg shadow-2xl mb-6 w-full max-w-xs border border-yellow-500/50 animate-pulse-slow">
            <h3 className="text-yellow-400 font-retro text-sm mb-4 text-center">NEW HIGH SCORE!</h3>
            <p className="text-white text-center font-mono text-3xl mb-4 text-cyan-400 drop-shadow-lg">{score}</p>
            <input
              autoFocus
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="YOUR NAME"
              className="w-full bg-slate-900 text-white font-mono text-center p-3 rounded border border-slate-600 mb-4 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 uppercase tracking-widest"
            />
            <button
               onClick={() => onSubmitHighScore(tempName || 'PLAYER')}
               className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
               <Save size={16} /> <span className="font-retro text-xs">SAVE SCORE</span>
            </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {gameState === 'MENU' ? (
            <button
              onClick={onStart}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded shadow-lg transform transition hover:scale-105 cursor-pointer border border-white/20"
            >
              <Play size={24} />
              <span className="font-retro text-sm">START GAME</span>
            </button>
          ) : gameState === 'GAME_OVER' ? (
            <button
              onClick={onStart}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded shadow-lg transform transition hover:scale-105 cursor-pointer border border-white/20"
            >
              <RotateCw size={24} />
              <span className="font-retro text-sm">TRY AGAIN</span>
            </button>
          ) : (
            <button
              onClick={onResume}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded shadow-lg transform transition hover:scale-105 cursor-pointer border border-white/20"
            >
              <Play size={24} />
              <span className="font-retro text-sm">RESUME</span>
            </button>
          )}

          {/* Options Button */}
          <button
             onClick={onOpenOptions}
             className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded shadow-lg transform transition hover:scale-105 cursor-pointer border border-white/10"
           >
             <Settings size={24} />
             <span className="font-retro text-sm">OPTIONS</span>
           </button>

          {(gameState === 'PAUSED' || gameState === 'GAME_OVER') && (
             <button
             onClick={onQuit}
             className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded shadow-lg transform transition hover:scale-105 cursor-pointer border border-white/10"
           >
             <X size={24} />
             <span className="font-retro text-sm">QUIT TO MENU</span>
           </button>
          )}
        </div>
      )}

      {/* Leaderboard Section */}
      {!isNewHighScore && (gameState === 'MENU' || gameState === 'GAME_OVER') && (
          <div className="bg-slate-900/60 p-5 rounded-lg shadow-xl mt-6 w-full max-w-xs border border-white/5 backdrop-blur-sm">
             <div className="flex items-center justify-center gap-2 mb-3 text-yellow-400">
                <Trophy size={16} />
                <h3 className="font-retro text-xs tracking-widest">LEADERBOARD</h3>
             </div>
             <div className="space-y-2">
                {highScores.length === 0 ? (
                    <p className="text-center text-white/30 font-mono text-xs py-2">NO SCORES YET</p>
                ) : (
                    highScores.map((s, i) => (
                        <div key={i} className="flex justify-between text-xs font-mono border-b border-white/5 pb-2 last:border-0 last:pb-0 pt-1">
                            <span className={`${i === 0 ? 'text-yellow-300 font-bold' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-300' : 'text-white/60'}`}>
                                {i + 1}. {s.name}
                            </span>
                            <span className="text-white/90">{s.score}</span>
                        </div>
                    ))
                )}
             </div>
          </div>
      )}
    </div>
  );
};

export default Menu;