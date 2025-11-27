import React, { useCallback, useEffect, useState, useRef } from 'react';
import TetrisBoard from './components/TetrisBoard';
import Menu from './components/Menu';
import NextPiece from './components/NextPiece';
import EffectsLayer from './components/EffectsLayer';
import { useGameLogic } from './hooks/useGameLogic';
import { GameState, HighScore } from './types';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, Play, X, Eye, EyeOff, Grid, Sparkles, Zap, ArrowDownToLine } from 'lucide-react';

// Define themes with background gradients and filter properties (hue, saturate, brightness, sepia)
const LEVEL_THEMES = [
  // Lvl 0: Deep Freeze (Native Colors - No Filter)
  { bg: 'from-slate-900 to-cyan-950', hue: 0, saturate: 100, brightness: 100, sepia: 0 },
  // Lvl 1: Pastel Dream
  { bg: 'from-pink-950 to-indigo-950', hue: 200, saturate: 70, brightness: 120, sepia: 0 },
  // Lvl 2: Neon Nights
  { bg: 'from-purple-900 to-blue-900', hue: 140, saturate: 150, brightness: 110, sepia: 0 },
  // Lvl 3: Golden Hour
  { bg: 'from-amber-900 to-orange-900', hue: 40, saturate: 100, brightness: 100, sepia: 0.3 },
  // Lvl 4: Matrix
  { bg: 'from-green-950 to-black', hue: 90, saturate: 200, brightness: 90, sepia: 1 },
  // Lvl 5: Noir
  { bg: 'from-gray-900 to-black', hue: 0, saturate: 0, brightness: 80, sepia: 0 },
  // Lvl 6: Crimson
  { bg: 'from-red-950 to-orange-950', hue: -45, saturate: 120, brightness: 90, sepia: 0 },
];

const StatsBox: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = "text-white" }) => (
  <div className="bg-slate-900/50 border border-white/10 p-4 rounded-lg backdrop-blur-sm w-full shadow-lg">
    <h3 className="text-gray-400 font-retro text-xs mb-1 tracking-wider">{label}</h3>
    <p className={`font-mono text-2xl md:text-3xl ${color} drop-shadow-md`}>{value}</p>
  </div>
);

function App() {
  const {
    stage,
    player,
    nextTetromino,
    score,
    level,
    rowsCleared,
    gameOver,
    gameState,
    setGameState,
    movePlayer,
    dropPlayer,
    hardDrop,
    playerRotate,
    resetGame,
    clearedRowsIndices,
    isTetris,
    ghostY,
    lastEvent
  } = useGameLogic();

  // High Scores State
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const gameOverProcessed = useRef(false);

  // Settings State
  const [showGhost, setShowGhost] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [enableShake, setEnableShake] = useState(true);
  const [enableHardDropShake, setEnableHardDropShake] = useState(true);
  
  const [showOptions, setShowOptions] = useState(false);

  // FX State
  const [shake, setShake] = useState(false);
  
  // Board Dimensions for Effects Layer
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardDims, setBoardDims] = useState({ width: 300, height: 600 });

  // Load High Scores
  useEffect(() => {
    const saved = localStorage.getItem('tetris_highscores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
  }, []);

  // Update Board Dims for Canvas
  useEffect(() => {
    const updateDims = () => {
      if (boardRef.current) {
        setBoardDims({
          width: boardRef.current.offsetWidth,
          height: boardRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', updateDims);
    updateDims();
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  // Handle Game Events for Global FX (Shake)
  useEffect(() => {
    if (!enableShake) return;

    if (lastEvent?.type === 'DROP') {
       if (enableHardDropShake) {
          setShake(true);
          setTimeout(() => setShake(false), 200);
       }
    } else if (lastEvent?.type === 'CLEAR' && (lastEvent.payload?.combo >= 4)) {
       setShake(true);
       setTimeout(() => setShake(false), 200);
    }
  }, [lastEvent, enableShake, enableHardDropShake]);

  // Check High Score on Game Over
  useEffect(() => {
    if (gameState === GameState.GAME_OVER && !gameOverProcessed.current) {
      gameOverProcessed.current = true;
      const lowestScore = highScores.length < 5 ? 0 : highScores[highScores.length - 1].score;
      // Only allow high scores if > 0
      if (score > 0 && (score > lowestScore || highScores.length < 5)) {
        setIsNewHighScore(true);
      }
    } else if (gameState !== GameState.GAME_OVER) {
      gameOverProcessed.current = false;
      setIsNewHighScore(false);
    }
  }, [gameState, score, highScores]);

  const handleSubmitScore = (name: string) => {
    const newEntry = { name, score };
    const newScores = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    setHighScores(newScores);
    localStorage.setItem('tetris_highscores', JSON.stringify(newScores));
    setIsNewHighScore(false);
    setGameState(GameState.MENU);
  };

  const handleStart = () => {
    resetGame();
    // Focus the board or body to capture keys immediately
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // Keyboard Controls
  const handleKeyDown = useCallback(({ keyCode }: { keyCode: number }) => {
    if (showOptions || isNewHighScore) return;

    if (gameState === GameState.PLAYING) {
      if (keyCode === 37) movePlayer(-1); // Left
      else if (keyCode === 39) movePlayer(1); // Right
      else if (keyCode === 40) dropPlayer(); // Down
      else if (keyCode === 38) playerRotate(stage, 1); // Up (Rotate)
      else if (keyCode === 32) hardDrop(); // Space (Hard Drop)
      else if (keyCode === 80) setGameState(GameState.PAUSED); // P (Pause)
      else if (keyCode === 27) setGameState(GameState.PAUSED); // Esc (Pause)
    } else if (gameState === GameState.PAUSED) {
      if (keyCode === 80 || keyCode === 27) setGameState(GameState.PLAYING);
    }
  }, [gameState, movePlayer, dropPlayer, playerRotate, stage, hardDrop, showOptions, isNewHighScore]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
      }
      handleKeyDown(e);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKeyDown]);

  const currentTheme = LEVEL_THEMES[level % LEVEL_THEMES.length];

  return (
    <div 
      className={`min-h-screen w-full bg-gradient-to-br ${currentTheme.bg} flex flex-col md:flex-row items-center justify-center p-4 md:gap-8 overflow-hidden transition-colors duration-1000 cursor-default ${shake ? 'animate-shake-hard' : ''}`}
    >
      {/* Menu Overlay */}
      {(gameState === GameState.MENU || gameState === GameState.PAUSED || gameState === GameState.GAME_OVER) && (
        <Menu 
          gameState={gameState} 
          onStart={handleStart}
          onResume={() => setGameState(GameState.PLAYING)}
          onQuit={() => setGameState(GameState.MENU)}
          onOpenOptions={() => setShowOptions(true)}
          score={score}
          highScores={highScores}
          isNewHighScore={isNewHighScore}
          onSubmitHighScore={handleSubmitScore}
        />
      )}

      {/* Options Modal */}
      {showOptions && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[60] backdrop-blur-sm p-4 cursor-default">
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-600 shadow-2xl w-full max-w-sm animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-retro text-white">OPTIONS</h2>
              <button onClick={() => setShowOptions(false)} className="text-white hover:text-red-400 transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <button 
                onClick={() => setShowGhost(!showGhost)}
                className="w-full flex items-center justify-between group p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {showGhost ? <Eye className="text-cyan-400" /> : <EyeOff className="text-slate-500" />}
                  <span className="font-mono text-sm text-white">Ghost Piece</span>
                </div>
                <div 
                  className={`px-4 py-2 rounded font-bold font-retro text-xs transition-all ${showGhost ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'bg-slate-700 text-slate-400'}`}
                >
                  {showGhost ? 'ON' : 'OFF'}
                </div>
              </button>

              <button 
                onClick={() => setShowGrid(!showGrid)}
                className="w-full flex items-center justify-between group p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                   <Grid className={showGrid ? "text-pink-400" : "text-slate-500"} />
                  <span className="font-mono text-sm text-white">Show Grid</span>
                </div>
                <div 
                  className={`px-4 py-2 rounded font-bold font-retro text-xs transition-all ${showGrid ? 'bg-pink-600 text-white shadow-[0_0_10px_rgba(219,39,119,0.5)]' : 'bg-slate-700 text-slate-400'}`}
                >
                  {showGrid ? 'ON' : 'OFF'}
                </div>
              </button>

              <button 
                onClick={() => setShowParticles(!showParticles)}
                className="w-full flex items-center justify-between group p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                   <Sparkles className={showParticles ? "text-yellow-400" : "text-slate-500"} />
                  <span className="font-mono text-sm text-white">Visual FX</span>
                </div>
                <div 
                  className={`px-4 py-2 rounded font-bold font-retro text-xs transition-all ${showParticles ? 'bg-yellow-600 text-white shadow-[0_0_10px_rgba(202,138,4,0.5)]' : 'bg-slate-700 text-slate-400'}`}
                >
                  {showParticles ? 'ON' : 'OFF'}
                </div>
              </button>

              <button 
                onClick={() => setEnableShake(!enableShake)}
                className="w-full flex items-center justify-between group p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                   <Zap className={enableShake ? "text-red-400" : "text-slate-500"} />
                  <span className="font-mono text-sm text-white">Screenshake</span>
                </div>
                <div 
                  className={`px-4 py-2 rounded font-bold font-retro text-xs transition-all ${enableShake ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-slate-700 text-slate-400'}`}
                >
                  {enableShake ? 'ON' : 'OFF'}
                </div>
              </button>

              {enableShake && (
                  <button 
                    onClick={() => setEnableHardDropShake(!enableHardDropShake)}
                    className="w-full flex items-center justify-between group p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer pl-8"
                  >
                    <div className="flex items-center gap-3">
                       <ArrowDownToLine className={enableHardDropShake ? "text-orange-400" : "text-slate-500"} />
                      <span className="font-mono text-sm text-white">Hard Drop Shake</span>
                    </div>
                    <div 
                      className={`px-4 py-2 rounded font-bold font-retro text-xs transition-all ${enableHardDropShake ? 'bg-orange-600 text-white shadow-[0_0_10px_rgba(234,88,12,0.5)]' : 'bg-slate-700 text-slate-400'}`}
                    >
                      {enableHardDropShake ? 'ON' : 'OFF'}
                    </div>
                  </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: Stats */}
      <div className="hidden md:flex flex-col gap-6 w-48 h-[600px] justify-start py-8">
         <div className="space-y-4">
            <StatsBox label="SCORE" value={score} color="text-yellow-400" />
            <StatsBox label="LEVEL" value={level} color="text-cyan-400" />
            <StatsBox label="LINES" value={rowsCleared} color="text-pink-400" />
         </div>
         <div className="mt-auto opacity-50 text-xs font-mono text-center border-t border-white/10 pt-4">
             <p className="mb-2">CONTROLS</p>
             <p>ARROWS to Move</p>
             <p>SPACE to Drop</p>
             <p>UP to Rotate</p>
         </div>
      </div>

      {/* MOBILE HEADER: Stats (Only visible on small screens) */}
      <div className="md:hidden flex w-full max-w-[300px] justify-between mb-4 gap-2">
         <div className="bg-slate-900/50 p-2 rounded border border-white/10 flex-1 text-center">
            <p className="text-[10px] font-retro text-slate-400">SCORE</p>
            <p className="text-yellow-400 font-mono font-bold">{score}</p>
         </div>
         <div className="bg-slate-900/50 p-2 rounded border border-white/10 flex-1 text-center">
            <p className="text-[10px] font-retro text-slate-400">LEVEL</p>
            <p className="text-cyan-400 font-mono font-bold">{level}</p>
         </div>
         <div className="bg-slate-900/50 p-2 rounded border border-white/10 flex-1 text-center">
            <p className="text-[10px] font-retro text-slate-400">LINES</p>
            <p className="text-pink-400 font-mono font-bold">{rowsCleared}</p>
         </div>
      </div>

      {/* CENTER COLUMN: Game Board */}
      <div className="relative z-10" ref={boardRef}>
        {/* Board */}
        <TetrisBoard
          stage={stage}
          clearedRowsIndices={clearedRowsIndices}
          isTetris={isTetris}
          hue={currentTheme.hue}
          saturate={currentTheme.saturate}
          brightness={currentTheme.brightness}
          sepia={currentTheme.sepia}
          showGhost={showGhost}
          ghostY={ghostY}
          playerPos={player.pos}
          playerShape={player.tetromino.shape}
          playerType={player.tetromino.type}
          showGrid={showGrid}
        />
        
        {/* Effects Layer Overlaid */}
        {showParticles && (
          <EffectsLayer 
            lastEvent={lastEvent} 
            width={boardDims.width} 
            height={boardDims.height} 
          />
        )}
      </div>

      {/* RIGHT COLUMN: Next Piece */}
      <div className="hidden md:flex flex-col gap-6 w-48 h-[600px] justify-start py-8">
          <div className="bg-slate-900/50 border-2 border-white/10 p-4 rounded-lg backdrop-blur-sm w-full shadow-lg h-48 flex flex-col items-center">
             <h3 className="text-gray-400 font-retro text-xs mb-4 tracking-wider self-start w-full text-center border-b border-white/5 pb-2">NEXT</h3>
             <div className="flex-1 flex items-center justify-center w-full">
                 <NextPiece 
                    tetromino={nextTetromino} 
                    hue={currentTheme.hue} 
                    saturate={currentTheme.saturate} 
                    brightness={currentTheme.brightness} 
                    sepia={currentTheme.sepia} 
                 />
             </div>
          </div>
      </div>

      {/* MOBILE CONTROLS */}
      <div className="md:hidden mt-6 grid grid-cols-3 gap-4 w-full max-w-[300px]">
        <div className="col-start-2 flex justify-center">
          <button 
            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30 backdrop-blur-sm border border-white/20"
            onTouchStart={(e) => { e.preventDefault(); playerRotate(stage, 1); }}
            onClick={() => playerRotate(stage, 1)}
          >
            <RotateCw size={24} />
          </button>
        </div>
        <div className="col-start-1 row-start-2 flex justify-center">
           <button 
            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30 backdrop-blur-sm border border-white/20"
            onTouchStart={(e) => { e.preventDefault(); movePlayer(-1); }}
            onClick={() => movePlayer(-1)}
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        <div className="col-start-2 row-start-2 flex justify-center">
           <button 
            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30 backdrop-blur-sm border border-white/20"
            onTouchStart={(e) => { e.preventDefault(); dropPlayer(); }}
            onClick={() => dropPlayer()}
          >
            <ArrowDown size={24} />
          </button>
        </div>
        <div className="col-start-3 row-start-2 flex justify-center">
           <button 
            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30 backdrop-blur-sm border border-white/20"
            onTouchStart={(e) => { e.preventDefault(); movePlayer(1); }}
            onClick={() => movePlayer(1)}
          >
            <ArrowRight size={24} />
          </button>
        </div>
        <div className="col-start-1 row-start-3 col-span-3 flex justify-center mt-2">
            <button 
                className="w-full h-12 bg-white/10 rounded-full flex items-center justify-center active:bg-white/30 backdrop-blur-sm border border-white/20 font-retro text-xs tracking-widest"
                onTouchStart={(e) => { e.preventDefault(); hardDrop(); }}
                onClick={() => hardDrop()}
            >
                HARD DROP
            </button>
        </div>
      </div>

    </div>
  );
}

export default App;