import { SaveSystem } from '../../save/SaveSystem';
import type { GameState } from '../../types';

// ローカルストレージのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('SaveSystem', () => {
  let saveSystem: SaveSystem;
  let mockGameState: GameState;

  beforeEach(() => {
    // ローカルストレージをクリア
    localStorageMock.clear();
    
    // SaveSystemの新しいインスタンスを作成
    saveSystem = new SaveSystem();
    
    // テスト用のゲーム状態を作成
    mockGameState = {
      storyId: 'test-story',
      currentSceneId: 'scene-1',
      playerChoices: ['choice-1', 'choice-2'],
      gameVariables: { score: 100, level: 2 },
      completedMiniGames: ['puzzle-1'],
      playTime: 3600,
      lastSaved: new Date('2024-01-01T12:00:00Z')
    };
  });

  describe('createSave', () => {
    it('新しいセーブデータを正常に作成できる', async () => {
      await saveSystem.createSave(1, mockGameState, 'テストセーブ');
      
      const saveSlots = saveSystem.getSaveSlots();
      expect(saveSlots).toHaveLength(1);
      expect(saveSlots[0].id).toBe(1);
      expect(saveSlots[0].name).toBe('テストセーブ');
      expect(saveSlots[0].gameState.storyId).toBe('test-story');
    });

    it('名前を指定しない場合はデフォルト名が使用される', async () => {
      await saveSystem.createSave(2, mockGameState);
      
      const saveSlots = saveSystem.getSaveSlots();
      expect(saveSlots[0].name).toBe('セーブデータ 2');
    });

    it('既存のセーブデータを上書きできる', async () => {
      // 最初のセーブ
      await saveSystem.createSave(1, mockGameState, '最初のセーブ');
      
      // 同じスロットに上書き
      const updatedGameState = { ...mockGameState, currentSceneId: 'scene-2' };
      await saveSystem.createSave(1, updatedGameState, '更新されたセーブ');
      
      const saveSlots = saveSystem.getSaveSlots();
      expect(saveSlots).toHaveLength(1);
      expect(saveSlots[0].name).toBe('更新されたセーブ');
      expect(saveSlots[0].gameState.currentSceneId).toBe('scene-2');
    });

    it('無効なスロットIDでエラーが発生する', async () => {
      await expect(saveSystem.createSave(0, mockGameState)).rejects.toThrow();
      await expect(saveSystem.createSave(11, mockGameState)).rejects.toThrow();
    });
  });

  describe('loadSave', () => {
    beforeEach(async () => {
      await saveSystem.createSave(1, mockGameState, 'テストセーブ');
    });

    it('セーブデータを正常に読み込める', async () => {
      const loadedGameState = await saveSystem.loadSave(1);
      
      expect(loadedGameState.storyId).toBe(mockGameState.storyId);
      expect(loadedGameState.currentSceneId).toBe(mockGameState.currentSceneId);
      expect(loadedGameState.playerChoices).toEqual(mockGameState.playerChoices);
      expect(loadedGameState.gameVariables).toEqual(mockGameState.gameVariables);
    });

    it('存在しないセーブデータでエラーが発生する', async () => {
      await expect(saveSystem.loadSave(5)).rejects.toThrow();
    });

    it('無効なスロットIDでエラーが発生する', async () => {
      await expect(saveSystem.loadSave(0)).rejects.toThrow();
      await expect(saveSystem.loadSave(11)).rejects.toThrow();
    });
  });

  describe('deleteSave', () => {
    beforeEach(async () => {
      await saveSystem.createSave(1, mockGameState, 'テストセーブ1');
      await saveSystem.createSave(2, mockGameState, 'テストセーブ2');
    });

    it('セーブデータを正常に削除できる', async () => {
      await saveSystem.deleteSave(1);
      
      const saveSlots = saveSystem.getSaveSlots();
      expect(saveSlots).toHaveLength(1);
      expect(saveSlots[0].id).toBe(2);
      
      await expect(saveSystem.loadSave(1)).rejects.toThrow();
    });

    it('存在しないセーブデータを削除してもエラーにならない', async () => {
      await expect(saveSystem.deleteSave(5)).resolves.not.toThrow();
    });

    it('無効なスロットIDでエラーが発生する', async () => {
      await expect(saveSystem.deleteSave(0)).rejects.toThrow();
      await expect(saveSystem.deleteSave(11)).rejects.toThrow();
    });
  });

  describe('getSaveSlots', () => {
    it('空の状態では空配列を返す', () => {
      const saveSlots = saveSystem.getSaveSlots();
      expect(saveSlots).toEqual([]);
    });

    it('セーブデータがある場合は正しい配列を返す', async () => {
      await saveSystem.createSave(3, mockGameState, 'セーブ3');
      await saveSystem.createSave(1, mockGameState, 'セーブ1');
      
      const saveSlots = saveSystem.getSaveSlots();
      expect(saveSlots).toHaveLength(2);
      expect(saveSlots[0].id).toBe(1); // ソートされている
      expect(saveSlots[1].id).toBe(3);
    });
  });

  describe('hasSave', () => {
    beforeEach(async () => {
      await saveSystem.createSave(1, mockGameState);
    });

    it('存在するセーブデータでtrueを返す', () => {
      expect(saveSystem.hasSave(1)).toBe(true);
    });

    it('存在しないセーブデータでfalseを返す', () => {
      expect(saveSystem.hasSave(2)).toBe(false);
    });
  });

  describe('getEmptySlotId', () => {
    it('空の状態では1を返す', () => {
      expect(saveSystem.getEmptySlotId()).toBe(1);
    });

    it('一部のスロットが埋まっている場合は最初の空きスロットを返す', async () => {
      await saveSystem.createSave(1, mockGameState);
      await saveSystem.createSave(3, mockGameState);
      
      expect(saveSystem.getEmptySlotId()).toBe(2);
    });

    it('すべてのスロットが埋まっている場合はnullを返す', async () => {
      // 10個すべてのスロットを埋める
      for (let i = 1; i <= 10; i++) {
        await saveSystem.createSave(i, mockGameState);
      }
      
      expect(saveSystem.getEmptySlotId()).toBe(null);
    });
  });

  describe('getSaveCount', () => {
    it('空の状態では0を返す', () => {
      expect(saveSystem.getSaveCount()).toBe(0);
    });

    it('セーブデータがある場合は正しい数を返す', async () => {
      await saveSystem.createSave(1, mockGameState);
      await saveSystem.createSave(3, mockGameState);
      
      expect(saveSystem.getSaveCount()).toBe(2);
    });
  });

  describe('getMaxSlots', () => {
    it('最大スロット数10を返す', () => {
      expect(saveSystem.getMaxSlots()).toBe(10);
    });
  });

  describe('ローカルストレージの永続化', () => {
    it('新しいインスタンスでも以前のセーブデータを読み込める', async () => {
      // 最初のインスタンスでセーブ
      await saveSystem.createSave(1, mockGameState, 'テストセーブ');
      
      // 新しいインスタンスを作成
      const newSaveSystem = new SaveSystem();
      
      // 以前のセーブデータが読み込まれているか確認
      const saveSlots = newSaveSystem.getSaveSlots();
      expect(saveSlots).toHaveLength(1);
      expect(saveSlots[0].name).toBe('テストセーブ');
      
      // セーブデータも正常に読み込める
      const loadedGameState = await newSaveSystem.loadSave(1);
      expect(loadedGameState.storyId).toBe(mockGameState.storyId);
    });
  });
});