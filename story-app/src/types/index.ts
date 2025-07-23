// Core type definitions for the story game application

export interface Story {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  scenes: Scene[];
  startSceneId: string;
}

export interface Scene {
  id: string;
  text: string;
  background?: string;
  characters?: Character[];
  choices?: Choice[];
  miniGame?: MiniGameTrigger;
  autoAdvance?: boolean;
  clickableElements?: ClickableElement[];
}

export interface Choice {
  id: string;
  text: string;
  nextSceneId: string;
  conditions?: Condition[];
  effects?: Effect[];
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  position: 'left' | 'center' | 'right';
}

export interface MiniGame {
  id: string;
  type: 'puzzle' | 'reflex' | 'memory' | 'quiz';
  config: MiniGameConfig;
  successScene: string;
  failureScene: string;
  retryAllowed: boolean;
}

export interface MiniGameTrigger {
  gameId: string;
  condition?: Condition;
}

export interface MiniGameConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  [key: string]: any;
}

export interface GameState {
  storyId: string;
  currentSceneId: string;
  playerChoices: string[];
  gameVariables: Record<string, any>;
  completedMiniGames: string[];
  playTime: number;
  lastSaved: Date;
}

export interface SaveSlot {
  id: number;
  name: string;
  gameState: GameState;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClickableElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: string;
  tooltip?: string;
  isHidden?: boolean;
  visibilityKey?: string;
  conditions?: Condition[];
  effects?: Effect[];
}

export interface Condition {
  type: 'variable' | 'choice' | 'minigame';
  key: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: any;
}

export interface Effect {
  type: 'variable' | 'scene';
  key: string;
  value: any;
}

export interface GameResult {
  success: boolean;
  score?: number;
  data?: any;
}