import { Tetromino, TetrominoType } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINOS: Record<string, Tetromino> = {
  0: { shape: [[0]], color: '0, 0, 0', type: TetrominoType.I }, // Dummy
  I: {
    type: TetrominoType.I,
    shape: [
      [0, TetrominoType.I, 0, 0],
      [0, TetrominoType.I, 0, 0],
      [0, TetrominoType.I, 0, 0],
      [0, TetrominoType.I, 0, 0],
    ],
    color: '80, 227, 230', // Cyan (Original I)
  },
  J: {
    type: TetrominoType.J,
    shape: [
      [0, TetrominoType.J, 0],
      [0, TetrominoType.J, 0],
      [TetrominoType.J, TetrominoType.J, 0],
    ],
    color: '36, 120, 223', // Deep Blue
  },
  L: {
    type: TetrominoType.L,
    shape: [
      [0, TetrominoType.L, 0],
      [0, TetrominoType.L, 0],
      [0, TetrominoType.L, TetrominoType.L],
    ],
    color: '60, 180, 200', // Teal/Slate
  },
  O: {
    type: TetrominoType.O,
    shape: [
      [TetrominoType.O, TetrominoType.O],
      [TetrominoType.O, TetrominoType.O],
    ],
    color: '200, 240, 255', // Ice White
  },
  S: {
    type: TetrominoType.S,
    shape: [
      [0, TetrominoType.S, TetrominoType.S],
      [TetrominoType.S, TetrominoType.S, 0],
      [0, 0, 0],
    ],
    color: '0, 255, 200', // Seafoam
  },
  T: {
    type: TetrominoType.T,
    shape: [
      [0, 0, 0],
      [TetrominoType.T, TetrominoType.T, TetrominoType.T],
      [0, TetrominoType.T, 0],
    ],
    color: '100, 150, 255', // Periwinkle
  },
  Z: {
    type: TetrominoType.Z,
    shape: [
      [TetrominoType.Z, TetrominoType.Z, 0],
      [0, TetrominoType.Z, TetrominoType.Z],
      [0, 0, 0],
    ],
    color: '0, 100, 180', // Dark Ocean
  },
  // New Shapes (Trominoes)
  I3: {
    type: TetrominoType.I3,
    shape: [
      [0, 0, 0],
      [TetrominoType.I3, TetrominoType.I3, TetrominoType.I3],
      [0, 0, 0],
    ],
    color: '255, 100, 100', // Light Red (3-in-a-row)
  },
  L3: {
    type: TetrominoType.L3,
    shape: [
      [TetrominoType.L3, TetrominoType.L3],
      [TetrominoType.L3, 0],
    ],
    color: '255, 0, 255', // Magenta (Corner shape)
  },
};

export const randomTetromino = (includeExtra = false): Tetromino => {
  const keys = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  if (includeExtra) {
    keys.push('I3', 'L3');
  }
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOS[randKey];
};