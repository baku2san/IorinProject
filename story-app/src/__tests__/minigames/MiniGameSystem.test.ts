// ミニゲームシステムのテスト
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MiniGameSystem, MiniGameSystemCallbacks } from '../../minigames/MiniGameSystem';
import { MiniGame, GameResult } from '../../types';

describe('MiniGameSystem', () => {
  let miniGameSystem: MiniGameSystem;
  let mockCallbacks: MiniGameSystemCallbacks;
  let mockGame: MiniGame;

  beforeEach(() => {
    // モックコールバックを作成
    mockCallbacks = {
      onGameComplete: vi.fn(),
      onGameExit: vi.fn(),
      onSceneTransition: vi.fn()
    };

    // ミニゲームシステムを初期化
    miniGameSystem = new MiniGameSystem(mockCallbacks);

    // テスト用のミニゲームを作成
    mockGame = {
      id: 'test-puzzle',
      type: 'puzzle',
      config: {
        difficulty: 'easy',
        timeLimit: 60
      },
      successScene: 'success-scene',
      failureScene: 'failure-scene',
      retryAllowed: true
    };
  });

  describe('registerMiniGame', () => {
    it('ミニゲームを正常に登録できる', () => {
      miniGameSystem.registerMiniGame(mockGame);
      
      const availableGames = miniGameSystem.getAvailableGames();
      expect(availableGames).toHaveLength(1);
      expect(availableGames[0]).toEqual(mockGame);
    });

    it('複数のミニゲームを登録できる', () => {
      const game2: MiniGame = {
        ...mockGame,
        id: 'test-reflex',
        type: 'reflex'
      };

      miniGameSystem.registerMiniGame(mockGame);
      miniGameSystem.registerMiniGame(game2);
      
      const availableGames = miniGameSystem.getAvailableGames();
      expect(availableGames).toHaveLength(2);
    });
  });

  describe('startMiniGame', () => {
    beforeEach(() => {
      miniGameSystem.registerMiniGame(mockGame);
    });

    it('存在しないゲームIDで開始しようとするとfalseを返す', () => {
      const result = miniGameSystem.startMiniGame('non-existent-game');
      expect(result).toBe(false);
    });

    it('ゲームが存在しない場合はエラーログが出力される', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      miniGameSystem.startMiniGame('non-existent-game');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Mini-game with id "non-existent-game" not found'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('getCurrentGame', () => {
    it('初期状態ではnullを返す', () => {
      expect(miniGameSystem.getCurrentGame()).toBeNull();
    });
  });

  describe('getAvailableGames', () => {
    it('初期状態では空の配列を返す', () => {
      expect(miniGameSystem.getAvailableGames()).toEqual([]);
    });
  });

  describe('isGameActive', () => {
    it('初期状態ではfalseを返す', () => {
      expect(miniGameSystem.isGameActive()).toBe(false);
    });
  });

  describe('canRetry', () => {
    it('現在のゲームがない場合はfalseを返す', () => {
      expect(miniGameSystem.canRetry()).toBe(false);
    });
  });

  describe('processGameResult', () => {
    beforeEach(() => {
      miniGameSystem.registerMiniGame(mockGame);
    });

    it('現在のゲームがない場合は何もしない', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result: GameResult = { success: true, score: 100 };
      miniGameSystem.processGameResult(result);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('pauseCurrentGame', () => {
    it('現在のゲームがない場合はfalseを返す', () => {
      const result = miniGameSystem.pauseCurrentGame();
      expect(result).toBe(false);
    });
  });

  describe('resumeCurrentGame', () => {
    it('現在のゲームがない場合はfalseを返す', () => {
      const result = miniGameSystem.resumeCurrentGame();
      expect(result).toBe(false);
    });
  });

  describe('resetCurrentGame', () => {
    it('現在のゲームがない場合はfalseを返す', () => {
      const result = miniGameSystem.resetCurrentGame();
      expect(result).toBe(false);
    });
  });

  describe('retryCurrentGame', () => {
    it('現在のゲームがない場合はfalseを返す', () => {
      const result = miniGameSystem.retryCurrentGame();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentGameState', () => {
    it('現在のゲームがない場合はnullを返す', () => {
      expect(miniGameSystem.getCurrentGameState()).toBeNull();
    });
  });
});