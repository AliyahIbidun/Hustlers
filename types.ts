export enum CharacterId {
  FEMI = 'Femi',
  ADA = 'Ada',
  SNIPER = 'Sniper',
  JUNIOR = 'Junior',
  ZEE = 'Zee',
  NARRATOR = 'Narrator',
  LAGOS = 'Lagos' // The city itself speaks
}

export interface Choice {
  id: string;
  text: string;
  effect: string; // Description of the consequence for the AI context
  statsChange?: {
    cash?: number;
    streetCred?: number;
    heat?: number;
    health?: number;
    energy?: number;
  }
}

export interface GameScene {
  id: string;
  backgroundMood: 'chaotic' | 'calm' | 'danger' | 'party' | 'tech';
  speaker: string;
  dialogue: string;
  choices: Choice[];
  isGameOver?: boolean;
  screenShake?: boolean;
  soundEffect?: 'siren' | 'traffic' | 'afrobeats' | 'silence';
}

export interface PlayerStats {
  cash: number;
  streetCred: number;
  heat: number; // Police attention
  health: number; // 0-100 (BitLife style)
  energy: number; // 0-100 (Action points)
}

export interface GameHistoryItem {
  speaker: string;
  dialogue: string;
  choiceMade?: string;
}