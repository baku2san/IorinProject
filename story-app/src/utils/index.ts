// Utility functions for the story game application

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const validateGameState = (gameState: any): boolean => {
  // TODO: Implement game state validation
  return gameState && 
         typeof gameState.storyId === 'string' &&
         typeof gameState.currentSceneId === 'string';
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};