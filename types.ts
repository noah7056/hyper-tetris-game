export enum TetrominoType {
  I = 'I',
  J = 'J',
  L = 'L',
  O = 'O',
  S = 'S',
  T = 'T',
  Z = 'Z',
  I3 = 'I3',
  L3 = 'L3',
}

export type TetrominoShape = (TetrominoType | 0)[][];

export interface Tetromino {
  type: TetrominoType;
  shape: TetrominoShape;
  color: string;
}

export type BoardCell = [TetrominoType | 0, string]; // [Type, ColorState (clear/merge)]

export type BoardShape = BoardCell[][];

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export interface Player {
  pos: { x: number; y: number };
  tetromino: Tetromino;
  collided: boolean;
}

export interface HighScore {
  name: string;
  score: number;
}

export type GameEventType = 'DROP' | 'LOCK' | 'CLEAR' | 'LEVEL_UP' | 'GAME_OVER';

export interface GameEvent {
  id: number;
  type: GameEventType;
  payload?: any;
}