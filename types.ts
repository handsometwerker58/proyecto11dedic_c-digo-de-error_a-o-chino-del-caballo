export enum FontType {
  SERIF = 'serif',
  SANS = 'sans',
}

export interface Blessing {
  title: string;
  poetry: string[]; // Vertical lines
  level: string; // e.g. "Great Blessing" (上上签)
}

export interface AppState {
  fontType: FontType;
  primaryColor: string;
  horseSpeed: number;
  snowSpeed: number;
  isExploded: boolean;
  introProgress: number; // 0 to 1
  currentBlessing: Blessing | null;
  blessingId: number; // Increment to trigger re-renders
}

export type AppAction = 
  | { type: 'SET_FONT'; payload: FontType }
  | { type: 'SET_COLOR'; payload: string }
  | { type: 'SET_HORSE_SPEED'; payload: number }
  | { type: 'SET_SNOW_SPEED'; payload: number }
  | { type: 'EXPLODE'; payload: boolean }
  | { type: 'SET_INTRO_PROGRESS'; payload: number }
  | { type: 'GENERATE_BLESSING'; payload: Blessing };
