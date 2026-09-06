export type GameState = 'SETUP' | 'PREPARING' | 'PLAYING' | 'COMPLETED';

export interface GameConfig {
  start: number;
  end: number;
  timedMode: boolean;
  timeLimit: number;
}

export interface PlacedNumber {
  value: number;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  fontSize: number;
  colorClass: string;
}

export interface Layout {
  items: PlacedNumber[];
}
