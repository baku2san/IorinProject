// GameEngine の統合テスト
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { GameEngine } from '../../engine/GameEngine';
import { StoryManager } from '../../story/StoryManager';
import { SaveSystem } from '../../save/SaveSystem';
import { MiniGameSystem } from '../../minigames/MiniGameSystem';
import { Story, Scene, Choice, GameState, GameResult, SaveSlot } from '../../types';

// モックの実装
vi.mock('../../save/SaveSystem');
vi.mock('../../minigames/MiniGameSystem');

describe('GameEngine', () => {
  // テスト用のモックデータ
  const mockStory: Story = {
    id: 'test-story',
    title: 'テストストーリー',
    description: 'テスト用の物語',
    thumbnail: '/test.svg',
    startSceneId: 'scene-1',
    scenes: [
      {
        id: 'scene-1',
        text: '最初のシーン',
        choices: [
          {
            id: 'choice-1',
            text: '選択肢1',
            nextSceneId: 'scene-2'
          },
          {
            id: 'choice-2',
            text: '選択肢2',
            nextSceneId: 'scene-3',
            effects: [
              {
                type: 'variable',
                key: 'hasVisitedScene3',
                value: true
              }
            ]
          }
        ]
      },
      {
        id: 'scene-2',
        text: '2番目のシーン',
        choices: [
          {
            id: 'choice-3',
            text: '選択肢3',
            nextSceneId: 'scene-4'
          }
        ]
      },
      {
        id: 'scene-3',
        text: '3番目のシーン',
        choices: [
          {
            id: 'choice-4',
            text: '選択肢4',
            nextSceneId: 'scene-4',
            conditions: [
              {
                type: 'variable',
                key: 'hasKey',
                operator: '==',
                value: true
              }
            ]
          }
        ]
      },
      {
        id: 'scene-4',
        text: '最後のシーン',
        miniGame: {
          gameId: 'test-game'
        }
      },
      {
        id: 'success-scene',
        text: 'ミニゲーム成功シーン'
      },
      {
        id: 'failure-scene',
        text: 'ミニゲーム失敗シーン'
      }
    ]
  };

  // テスト用の変数
  let gameEngine: GameEngine;
  let storyManager: StoryManager;
  let saveSystem: SaveSystem;
  let miniGameSystem: MiniGameSystem;

  beforeEach(() => {
    // モックのリセット
    vi.clearAllMocks();
    
    // StoryManagerの設定
    storyManager = new StoryManager([mockStory]);
    
    // SaveSystemのモック設定
    saveSystem = new SaveSystem();
    (saveSystem.createSave as any) = vi.fn().mockResolvedValue(undefined);
    (saveSystem.loadSave as any) = vi.fn().mockImplementation((slotId: number) => {
      const mockGameState: GameState = {
        storyId: 'test-story',
        currentSceneId: 'scene-2',
        playerChoices: ['choice-1'],
        gameVariables: { hasKey: true },
        completedMiniGames: [],
        playTime: 120,
        lastSaved: new Date()
      };
      return Promise.resolve(mockGameState);
    });
    (saveSystem.getSaveSlots as any) = vi.fn().mockReturnValue([]);
    
    // MiniGameSystemのモック設定
    miniGameSystem = new MiniGameSystem();
    (miniGameSystem.startMiniGame as any) = vi.fn();
    (miniGameSystem.getCurrentGame as any) = vi.fn().mockReturnValue({
      id: 'test-game',
      type: 'puzzle',
      config: { difficulty: 'easy' },
      successScene: 'success-scene',
      failureScene: 'failure-scene',
      retryAllowed: true
    });
    
    // GameEngineのインスタンス作成
    gameEngine = new GameEngine(storyManager, saveSystem, miniGameSystem);
    
    // setIntervalのモック
    vi.useFakeTimers();
  });

  afterEach(() => {
    // タイマーのクリーンアップ
    vi.useRealTimers();
    gameEngine.cleanup();
  });

  test('物語を読み込むことができる', async () => {
    await gameEngine.loadStory('test-story');
    
    expect(gameEngine.getCurrentStory()).not.toBeNull();
    expect(gameEngine.getCurrentStory()?.id).toBe('test-story');
    expect(gameEngine.getCurrentScene()?.id).toBe('scene-1');
    expect(gameEngine.getGameState()).not.toBeNull();
    expect(gameEngine.getGameState()?.storyId).toBe('test-story');
    expect(gameEngine.getGameState()?.currentSceneId).toBe('scene-1');
  });

  test('存在しない物語IDを読み込もうとするとエラーがスローされる', async () => {
    await expect(gameEngine.loadStory('non-existent-story')).rejects.toThrow();
  });

  test('選択肢を処理できる', async () => {
    await gameEngine.loadStory('test-story');
    gameEngine.processChoice('choice-1');
    
    expect(gameEngine.getCurrentScene()?.id).toBe('scene-2');
    expect(gameEngine.getGameState()?.currentSceneId).toBe('scene-2');
    expect(gameEngine.getGameState()?.playerChoices).toContain('choice-1');
  });

  test('選択肢の効果が適用される', async () => {
    await gameEngine.loadStory('test-story');
    gameEngine.processChoice('choice-2');
    
    expect(gameEngine.getCurrentScene()?.id).toBe('scene-3');
    expect(gameEngine.getGameState()?.gameVariables.hasVisitedScene3).toBe(true);
  });

  test('条件を満たさない選択肢を処理しようとするとエラーがスローされる', async () => {
    await gameEngine.loadStory('test-story');
    gameEngine.processChoice('choice-2'); // scene-3に移動
    
    // 条件を満たさない状態で選択肢を処理しようとする
    expect(() => gameEngine.processChoice('choice-4')).toThrow();
    
    // 条件を満たすように変数を設定
    gameEngine.updateGameVariables({ hasKey: true });
    
    // 今度は成功するはず
    gameEngine.processChoice('choice-4');
    expect(gameEngine.getCurrentScene()?.id).toBe('scene-4');
  });

  test('指定したシーンに直接移動できる', async () => {
    await gameEngine.loadStory('test-story');
    const result = gameEngine.navigateToScene('scene-3');
    
    expect(result).toBe(true);
    expect(gameEngine.getCurrentScene()?.id).toBe('scene-3');
    expect(gameEngine.getGameState()?.currentSceneId).toBe('scene-3');
  });

  test('存在しないシーンに移動しようとすると失敗する', async () => {
    await gameEngine.loadStory('test-story');
    const result = gameEngine.navigateToScene('non-existent-scene');
    
    expect(result).toBe(false);
    // 現在のシーンは変わらない
    expect(gameEngine.getCurrentScene()?.id).toBe('scene-1');
  });

  test('ゲームをセーブできる', async () => {
    await gameEngine.loadStory('test-story');
    await gameEngine.saveGame(1);
    
    expect(saveSystem.createSave).toHaveBeenCalledWith(1, expect.any(Object));
  });

  test('ゲームをロードできる', async () => {
    await gameEngine.loadGame(1);
    
    expect(saveSystem.loadSave).toHaveBeenCalledWith(1);
    expect(gameEngine.getCurrentStory()?.id).toBe('test-story');
    expect(gameEngine.getCurrentScene()?.id).toBe('scene-2');
    expect(gameEngine.getGameState()?.playerChoices).toContain('choice-1');
    expect(gameEngine.getGameState()?.gameVariables.hasKey).toBe(true);
  });

  test('ミニゲームのトリガーを検出できる', async () => {
    await gameEngine.loadStory('test-story');
    gameEngine.navigateToScene('scene-4');
    
    expect(miniGameSystem.startMiniGame).toHaveBeenCalledWith('test-game');
  });

  test('ミニゲームの結果を処理できる', async () => {
    await gameEngine.loadStory('test-story');
    gameEngine.navigateToScene('scene-4');
    
    // 成功結果の処理
    const successResult: GameResult = { success: true };
    gameEngine.processMiniGameResult(successResult);
    
    expect(gameEngine.getCurrentScene()?.id).toBe('success-scene');
    expect(gameEngine.getGameState()?.completedMiniGames).toContain('test-game');
    
    // 失敗結果の処理
    gameEngine.navigateToScene('scene-4');
    const failureResult: GameResult = { success: false };
    gameEngine.processMiniGameResult(failureResult);
    
    expect(gameEngine.getCurrentScene()?.id).toBe('failure-scene');
    // 失敗したゲームはcompletedMiniGamesに追加されない
    expect(gameEngine.getGameState()?.completedMiniGames).toHaveLength(1);
  });

  test('自動進行モードを切り替えられる', async () => {
    await gameEngine.loadStory('test-story');
    
    expect(gameEngine.isAutoAdvanceEnabled()).toBe(false);
    
    gameEngine.toggleAutoAdvance();
    expect(gameEngine.isAutoAdvanceEnabled()).toBe(true);
    
    gameEngine.toggleAutoAdvance();
    expect(gameEngine.isAutoAdvanceEnabled()).toBe(false);
  });

  test('ゲーム変数を更新できる', async () => {
    await gameEngine.loadStory('test-story');
    
    gameEngine.updateGameVariables({ score: 100, hasKey: true });
    expect(gameEngine.getGameState()?.gameVariables.score).toBe(100);
    expect(gameEngine.getGameState()?.gameVariables.hasKey).toBe(true);
    
    gameEngine.updateGameVariables({ score: 150 });
    expect(gameEngine.getGameState()?.gameVariables.score).toBe(150);
    expect(gameEngine.getGameState()?.gameVariables.hasKey).toBe(true);
  });

  test('プレイ時間が自動的に更新される', async () => {
    await gameEngine.loadStory('test-story');
    
    // 初期値は0
    expect(gameEngine.getGameState()?.playTime).toBe(0);
    
    // 5秒進める
    vi.advanceTimersByTime(5000);
    
    // プレイ時間が5秒になっているはず
    expect(gameEngine.getGameState()?.playTime).toBe(5);
  });
});