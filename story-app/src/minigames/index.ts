// ミニゲームシステムのエクスポート
export { MiniGameSystem } from './MiniGameSystem';
export type { MiniGameSystemCallbacks } from './MiniGameSystem';

export { BaseMiniGame } from './BaseMiniGame';
export type { MiniGameProps, MiniGameState } from './BaseMiniGame';

export { MiniGameComponent, useMiniGameState } from './MiniGameComponent';
export type { MiniGameComponentProps, MiniGameComponentState } from './MiniGameComponent';

// 将来的に追加される具体的なミニゲーム
// export { PuzzleGame } from './games/PuzzleGame';
// export { ReflexGame } from './games/ReflexGame';
// export { MemoryGame } from './games/MemoryGame';
// export { QuizGame } from './games/QuizGame';