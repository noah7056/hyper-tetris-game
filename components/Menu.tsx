import React, { useState } from 'react';
import { Play, Pause, X, Settings, Trophy, Save, RotateCw, ChevronLeft, ChevronRight, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { HighScore } from '../types';

interface Props {
  gameState: 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
  onStart: (level?: number) => void;
  onResume: () => void;
  onQuit: () => void;
  onOpenOptions: () => void;
  score: number;
  highScores: HighScore[];
  isNewHighScore: boolean;
  onSubmitHighScore: (name: string) => void;
  startLevel: number;
  onSetStartLevel: (level: number) => void;
  lastSessionLevel?: number;
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
  onSubmitHighScore,
  startLevel,
  onSetStartLevel,
  lastSessionLevel = 0
}) => {
  const [tempName, setTempName] = useState('');
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  if (gameState === 'PLAYING') return null;

  const handleStartGame = () => {
    // If level select is open, use the startLevel. If not, force 0.
    onStart(showLevelSelect ? startLevel : 0);
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4 backdrop-blur-sm rounded-xl overflow-y-auto cursor-default">
      
      {/* Hyper Logo */}
      <div className="relative mb-8 text-center animate-pulse">
        <h1 className="text-4xl md:text-6xl font-retro text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 hyper-text-shadow italic transform -skew-x-12">
          HYPER
        </h1>
        <h1 className="text-4xl md:text-6xl font-retro text-white tetris-text-shadow transform -skew-x-12 -mt-2">
          TETRIS
        </h1>
      </div>

      {/* Main Menu Content */}
      {gameState === 'MENU' && (
        <div className="flex flex-col gap-4 w-full max-w-xs animate-fade-in-up">
           
           <button 
            onClick={handleStartGame}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-retro text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(8,145,178,0.5)] cursor-pointer group z-10"
          >
            <Play fill="currentColor" className="group-hover:animate-pulse" />
            START GAME
          </button>

          <button 
             onClick={() => setShowLevelSelect(!showLevelSelect)}
             className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 -mt-2 mb-2 cursor-pointer"
          >
            {showLevelSelect ? 'HIDE LEVEL SELECT' : 'START FROM LEVEL'}
            {showLevelSelect ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

           {showLevelSelect && (
             <div className="bg-slate-800/80 p-4 rounded-lg border border-white/10 mb-2 animate-fade-in-down">
                <label className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-retro text-cyan-400">
                    <span>LEVEL</span>
                    <span className="text-xl text-white">{startLevel}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={startLevel} 
                    onChange={(e) => onSetStartLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </label>
                
                <div className="flex items-start gap-2 text-yellow-500 text-[10px] font-mono bg-yellow-500/10 p-2 rounded border border-yellow-500/20 mt-3">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  <span>Leaderboard disabled when starting above Level 0.</span>
                </div>
             </div>
           )}
          
          <button 
            onClick={onOpenOptions}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-800 rounded-lg font-retro text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-600 cursor-pointer"
          >
            <Settings size={20} />
            OPTIONS
          </button>

          {highScores.length > 0 && (
             <div className="mt-6 bg-black/40 p-4 rounded-lg border border-white/10 w-full">
                <div className="flex items-center gap-2 mb-3 text-yellow-400 justify-center">
                  <Trophy size={16} />
                  <h3 className="font-retro text-xs">LEADERBOARD</h3>
                </div>
                <table className="w-full text-left text-xs font-mono">
                  <tbody>
                    {highScores.map((entry, i) => (
                      <tr key={i} className="border-b border-white/5 last:border-0">
                        <td className="py-1 text-slate-400 w-6">{i + 1}.</td>
                        <td className="py-1 text-white">{entry.name}</td>
                        <td className="py-1 text-right text-cyan-400">{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}
        </div>
      )}

      {/* Paused Menu */}
      {gameState === 'PAUSED' && (
        <div className="flex flex-col gap-4 w-full max-w-xs animate-fade-in-up">
           <h2 className="text-3xl font-retro text-center text-white mb-4 animate-pulse">PAUSED</h2>
           <button 
            onClick={onResume}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-green-600 rounded-lg font-retro text-white hover:bg-green-500 transition-all shadow-lg cursor-pointer"
          >
            <Play fill="currentColor" />
            RESUME
          </button>
           <button 
            onClick={onOpenOptions}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-800 rounded-lg font-retro text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-600 cursor-pointer"
          >
            <Settings size={20} />
            OPTIONS
          </button>
           <button 
            onClick={onQuit}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-red-900/50 rounded-lg font-retro text-red-300 hover:bg-red-800 hover:text-white transition-all border border-red-800 cursor-pointer"
          >
            <X size={20} />
            QUIT TO MENU
          </button>
        </div>
      )}

      {/* Game Over */}
      {gameState === 'GAME_OVER' && (
        <div className="flex flex-col gap-4 w-full max-w-xs animate-fade-in-up text-center">
           <h2 className="text-4xl font-retro text-red-500 mb-2 tetris-text-shadow shake-constant shake-slow">GAME OVER</h2>
           <p className="font-mono text-slate-300 mb-6">FINAL SCORE: <span className="text-white text-xl">{score}</span></p>

           {/* Buttons moved above Leaderboard as requested */}
           <button 
            onClick={() => onStart(lastSessionLevel)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-retro text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(8,145,178,0.5)] cursor-pointer"
          >
            <RotateCw size={20} />
            TRY AGAIN
          </button>
          
          <button 
            onClick={onOpenOptions}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-800 rounded-lg font-retro text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-600 cursor-pointer"
          >
            <Settings size={20} />
            OPTIONS
          </button>

           <button 
            onClick={onQuit}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-red-900/50 rounded-lg font-retro text-red-300 hover:bg-red-800 hover:text-white transition-all border border-red-800 cursor-pointer"
          >
            <X size={20} />
            QUIT TO MENU
          </button>

           {/* Leaderboard or Input moved to bottom */}
           <div className="mt-2 w-full">
            {isNewHighScore ? (
              <div className="bg-slate-800 p-6 rounded-lg border border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-bounce-short">
                  <h3 className="text-yellow-400 font-retro text-sm mb-4 flex items-center justify-center gap-2">
                    <Trophy size={16} /> NEW HIGH SCORE!
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      type="text" 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value.toUpperCase().slice(0, 10))}
                      placeholder="YOUR NAME"
                      className="bg-black/50 border border-slate-600 rounded px-3 py-2 text-white font-mono w-full focus:outline-none focus:border-cyan-400"
                    />
                    <button 
                      onClick={() => tempName && onSubmitHighScore(tempName)}
                      className="bg-cyan-600 text-white p-2 rounded hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      disabled={!tempName}
                    >
                      <Save size={20} />
                    </button>
                  </div>
              </div>
            ) : (
                highScores.length > 0 && (
                  <div className="bg-black/40 p-4 rounded-lg border border-white/10 w-full">
                    <div className="flex items-center gap-2 mb-3 text-yellow-400 justify-center">
                      <Trophy size={16} />
                      <h3 className="font-retro text-xs">LEADERBOARD</h3>
                    </div>
                    <table className="w-full text-left text-xs font-mono">
                      <tbody>
                        {highScores.map((entry, i) => (
                          <tr key={i} className={`border-b border-white/5 last:border-0 ${score === entry.score ? 'bg-white/10' : ''}`}>
                            <td className="py-1 text-slate-400 w-6">{i + 1}.</td>
                            <td className="py-1 text-white">{entry.name}</td>
                            <td className="py-1 text-right text-cyan-400">{entry.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                )
            )}
           </div>

        </div>
      )}

    </div>
  );
};

export default Menu;