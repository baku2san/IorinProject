// BaseMiniGameクラスのテスト
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseMiniGame, MiniGameProps } from '../../minigames/BaseMiniGame';
import { MiniGameConfig, GameResult } from '../../types';
import React from 'react';

// テスト用の具象クラス
class TestMiniGame extends BaseMiniGame {
  private started = false;
  private paused = false;

  start(): void {
    this.state.isActive = true;
    this.started = true;
  }

  pause(): void {
    this.state.isPaused = true;
    this.paused = true;
  }

  resume(): void {
    this.state.isPaused = false;
    this.paused = false;
  }

  reset(): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.score = 0;
    this.started = false;
    this.paused = false;
  }

  getComponent(): React.ComponentType<any> {
    return () => React.createElement('div', null, 'Test Game Component');
  }

  // テスト用のヘルパーメソッド
  public testComplete(result: GameResult): void {
    this.complete(result);
  }

  public testExit(): void {
    this.exit();
  }

  public testHandleTimeUp(): void {
    this.handleTimeUp();
  }

  public getStarted(): boolean {
    return this.started;
  }

  public getPaused(): boolean {
    return this.paused;
  }
}

describe('BaseMiniGame', () => {
  let mockProps: MiniGameProps;
  let mockConfig: MiniGameConfig;
  let onCompleteMock: ReturnType<typeof vi.fn>;
  let onExitMock: ReturnType<typeof vi.fn>;
  let testGame: TestMiniGame;

  beforeEach(() => {
    onCompleteMock = vi.fn();
    onExitMock = vi.fn();

    mockConfig = {
      difficulty: 'medium',
      timeLimit: 30
    };

    mockProps = {
      config: mockConfig,
      onComplete: onCompleteMock,
      onExit: onExitMock
    };

    testGame = new TestMiniGame(mockProps);
  });

  describe('constructor', () => {
    it('初期状態が正しく設定される', () => {
      const state = testGame.getState();
      
      expect(state.isActive).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.score).toBe(0);
      expect(state.timeRemaining).toBe(30);
    });

    it('設定が正しく保存される', () => {
      const config = testGame.getConfig();
      
      expect(config.difficulty).toBe('medium');
      expect(config.timeLimit).toBe(30);
    });
  });

  describe('start', () => {
    it('ゲームを開始できる', () => {
      testGame.start();
      
      expect(testGame.getStarted()).toBe(true);
      expect(testGame.isActive()).toBe(true);
    });
  });

  describe('pause', () => {
    it('ゲームを一時停止できる', () => {
      testGame.start();
      testGame.pause();
      
      expect(testGame.getPaused()).toBe(true);
      expect(testGame.isPaused()).toBe(true);
    });
  });

  describe('resume', () => {
    it('ゲームを再開できる', () => {
      testGame.start();
      testGame.pause();
      testGame.resume();
      
      expect(testGame.getPaused()).toBe(false);
      expect(testGame.isPaused()).toBe(false);
    });
  });

  describe('reset', () => {
    it('ゲームをリセットできる', () => {
      testGame.start();
      testGame.reset();
      
      expect(testGame.getStarted()).toBe(false);
      expect(testGame.isActive()).toBe(false);
      expect(testGame.getState().score).toBe(0);
    });
  });

  describe('complete', () => {
    it('ゲーム完了時にコールバックが呼ばれる', () => {
      const result: GameResult = {
        success: true,
        score: 100,
        data: { bonus: 50 }
      };

      testGame.testComplete(result);

      expect(onCompleteMock).toHaveBeenCalledWith(result);
      expect(testGame.isActive()).toBe(false);
    });

    it('失敗時のゲーム完了も正しく処理される', () => {
      const result: GameResult = {
        success: false,
        score: 25
      };

      testGame.testComplete(result);

      expect(onCompleteMock).toHaveBeenCalledWith(result);
      expect(testGame.isActive()).toBe(false);
    });
  });

  describe('exit', () => {
    it('ゲーム終了時にコールバックが呼ばれる', () => {
      testGame.testExit();

      expect(onExitMock).toHaveBeenCalled();
      expect(testGame.isActive()).toBe(false);
    });
  });

  describe('handleTimeUp', () => {
    it('時間切れ時に失敗として完了する', () => {
      testGame.testHandleTimeUp();

      expect(onCompleteMock).toHaveBeenCalledWith({
        success: false,
        score: 0,
        data: { reason: 'timeout' }
      });
    });
  });

  describe('getComponent', () => {
    it('Reactコンポーネントを返す', () => {
      const Component = testGame.getComponent();
      expect(Component).toBeDefined();
      expect(typeof Component).toBe('function');
    });
  });

  describe('時間制限なしの場合', () => {
    beforeEach(() => {
      const configWithoutTimeLimit: MiniGameConfig = {
        difficulty: 'easy'
      };

      const propsWithoutTimeLimit: MiniGameProps = {
        config: configWithoutTimeLimit,
        onComplete: onCompleteMock,
        onExit: onExitMock
      };

      testGame = new TestMiniGame(propsWithoutTimeLimit);
    });

    it('timeRemainingがundefinedになる', () => {
      const state = testGame.getState();
      expect(state.timeRemaining).toBeUndefined();
    });
  });
});