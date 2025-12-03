import { useState, useCallback, useEffect } from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH, randomTetromino, TETROMINOS } from '../constants';
import { BoardShape, GameState, Player, Tetromino, GameEvent } from '../types';
import { useInterval } from './useInterval';

const createStage = (): BoardShape =>
  Array.from(Array(BOARD_HEIGHT), () =>
    new Array(BOARD_WIDTH).fill([0, 'clear'])
  );

const checkCollision = (
  player: Player,
  stage: BoardShape,
  { x: moveX, y: moveY }: { x: number; y: number }
) => {
  for (let y = 0; y < player.tetromino.shape.length; y += 1) {
    for (let x = 0; x < player.tetromino.shape[y].length; x += 1) {
      // 1. Check that we're on an actual Tetromino cell
      if (player.tetromino.shape[y][x] !== 0) {
        if (
          // 2. Check that our move is inside the game areas height (y)
          // We shouldn't go through the bottom of the play area
          !stage[y + player.pos.y + moveY] ||
          // 3. Check that our move is inside the game areas width (x)
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          // 4. Check that the cell we're moving to isn't set to clear
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !==
            'clear'
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export const useGameLogic = (useExtraShapes: boolean) => {
  const [stage, setStage] = useState<BoardShape>(createStage());
  const [rowsCleared, setRowsCleared] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  
  // Visual effects state
  const [clearedRowsIndices, setClearedRowsIndices] = useState<number[]>([]);
  const [isTetris, setIsTetris] = useState(false);
  
  // Event system for Effects Layer
  const [lastEvent, setLastEvent] = useState<GameEvent | null>(null);
  const [eventIdCounter, setEventIdCounter] = useState(0);

  const emitEvent = useCallback((type: GameEvent['type'], payload?: any) => {
    setEventIdCounter(prev => {
      const newId = prev + 1;
      setLastEvent({ id: newId, type, payload });
      return newId;
    });
  }, []);

  // Next Piece State
  const [nextTetromino, setNextTetromino] = useState<Tetromino>(randomTetromino(useExtraShapes));

  const [player, setPlayer] = useState<Player>({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0], // dummy
    collided: false,
  });

  const resetGame = useCallback((startLevel = 0) => {
    setStage(createStage());
    setGameOver(false);
    setScore(0);
    setRowsCleared(0);
    setLevel(startLevel);
    setClearedRowsIndices([]);
    setIsTetris(false);
    setGameState(GameState.PLAYING);
    setLastEvent(null);
    
    // Initialize pieces
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
      tetromino: randomTetromino(useExtraShapes),
      collided: false,
    });
    setNextTetromino(randomTetromino(useExtraShapes));
  }, [useExtraShapes]);

  const movePlayer = (dir: number) => {
    if (player.collided) return; // Prevent moving if already locked
    setPlayer((prev) => {
      if (!checkCollision(prev, stage, { x: dir, y: 0 })) {
        return {
          ...prev,
          pos: { x: prev.pos.x + dir, y: prev.pos.y },
        };
      }
      return prev;
    });
  };

  const drop = () => {
    // Increase level every 10 rows
    if (rowsCleared > (level + 1) * 10) {
      setLevel((prev) => {
        const newLevel = prev + 1;
        emitEvent('LEVEL_UP', newLevel);
        return newLevel;
      });
    }

    setPlayer((prev) => {
      if (!checkCollision(prev, stage, { x: 0, y: 1 })) {
        return {
          ...prev,
          pos: { x: prev.pos.x, y: prev.pos.y + 1 },
        };
      }
      // Collided
      return { ...prev, collided: true };
    });
  };

  const dropPlayer = () => {
    if (player.collided) return;
    drop();
  };

  const hardDrop = () => {
    if (player.collided || gameState !== GameState.PLAYING) return;
    
    let tempY = player.pos.y;
    // Calculate the lowest possible Y
    while (!checkCollision({ ...player, pos: { x: player.pos.x, y: tempY } }, stage, { x: 0, y: 1 })) {
      tempY += 1;
    }
    
    // Emit Drop Event with impact position
    const finalY = tempY; // This is the y-coordinate of the bottom-most cell of the piece's bounding box relative to stage? No, tempY is pos.y
    emitEvent('DROP', { x: player.pos.x, y: finalY, shape: player.tetromino.shape });

    setPlayer(prev => ({
      ...prev,
      pos: { x: prev.pos.x, y: tempY },
      collided: true
    }));
  };

  const rotate = (matrix: any[][], dir: number) => {
    // Transpose
    const rotated = matrix.map((_, index) =>
      matrix.map((col) => col[index])
    );
    // Reverse each row to get a rotated matrix
    if (dir > 0) return rotated.map((row) => row.reverse());
    return rotated.reverse();
  };

  const playerRotate = (stage: BoardShape, dir: number) => {
    if (player.collided) return;

    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino.shape = rotate(clonedPlayer.tetromino.shape, dir);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino.shape[0].length) {
        rotate(clonedPlayer.tetromino.shape, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    setPlayer(clonedPlayer);
  };

  // Logic to spawn the next piece from the preview
  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
      tetromino: nextTetromino, // Use the previewed piece
      collided: false,
    });
    setNextTetromino(randomTetromino(useExtraShapes)); // Generate a new preview
  }, [nextTetromino, useExtraShapes]);

  // This function updates the board when a piece lands
  const updateStage = (prevStage: BoardShape) => {
    // First flush the stage from the previous render
    const newStage = prevStage.map((row) =>
      row.map((cell) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
    ) as BoardShape;

    // Draw the tetromino
    player.tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const stageY = y + player.pos.y;
          const stageX = x + player.pos.x;
          if (
            stageY >= 0 &&
            stageY < BOARD_HEIGHT &&
            stageX >= 0 &&
            stageX < BOARD_WIDTH
          ) {
            newStage[stageY][stageX] = [
              value,
              `${player.collided ? 'merged' : 'clear'}`,
            ];
          }
        }
      });
    });

    // Check collision logic to lock piece
    if (player.collided) {
      // Check for Game Over: if we collided and are at the very top
      if (player.pos.y <= 0) {
        setGameOver(true);
        setGameState(GameState.GAME_OVER);
        emitEvent('GAME_OVER');
        return newStage;
      }

      // Emit Lock Event
      emitEvent('LOCK', { x: player.pos.x, y: player.pos.y });

      resetPlayer();
      return sweepRows(newStage);
    }

    return newStage;
  };

  const sweepRows = (newStage: BoardShape) => {
    const rowsToClear: number[] = [];
    newStage.forEach((row, index) => {
      if (row.every((cell) => cell[0] !== 0)) {
        rowsToClear.push(index);
      }
    });

    if (rowsToClear.length > 0) {
      // Trigger animation
      setClearedRowsIndices(rowsToClear);
      const isFourLines = rowsToClear.length >= 4;
      if (isFourLines) {
          setIsTetris(true);
      }
      
      // Calculate score immediately
      const basePoints = [40, 100, 300, 1200];
      const points = basePoints[rowsToClear.length - 1] * (level + 1);
      
      setScore((prev) => prev + points);
      setRowsCleared((prev) => prev + rowsToClear.length);
      
      // Emit Clear Event
      emitEvent('CLEAR', { rows: rowsToClear, points, combo: rowsToClear.length });

      // Return a temporary stage with cleared rows visually marked but data intact
      // We will actually remove them in a useEffect to allow animation to play
      return newStage;
    }
    return newStage;
  };

  // Effect to handle actual row removal after animation
  useEffect(() => {
    if (clearedRowsIndices.length > 0) {
      // Small delay to let CSS animation play
      const timer = setTimeout(() => {
        setStage((prev) => {
          const newStage = prev.filter((_, index) => !clearedRowsIndices.includes(index));
          const newRows = Array.from(Array(clearedRowsIndices.length), () =>
            new Array(BOARD_WIDTH).fill([0, 'clear'])
          ) as BoardShape;
          return [...newRows, ...newStage];
        });
        setClearedRowsIndices([]);
        setIsTetris(false);
      }, 300); // 300ms match CSS animation
      return () => clearTimeout(timer);
    }
  }, [clearedRowsIndices]);

  useEffect(() => {
    setStage((prev) => updateStage(prev));
  }, [player, resetPlayer]); // Update stage when player moves

  // Game Loop
  useInterval(() => {
    drop();
  }, gameState === GameState.PLAYING && clearedRowsIndices.length === 0 ? Math.max(100, 1000 - (level * 50)) : null);

  // Calculate Ghost Y
  let ghostY = player.pos.y;
  if (!player.collided && gameState === GameState.PLAYING) {
      while (!checkCollision({ ...player, pos: { x: player.pos.x, y: ghostY } }, stage, { x: 0, y: 1 })) {
          ghostY += 1;
      }
  }

  return {
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
  };
};