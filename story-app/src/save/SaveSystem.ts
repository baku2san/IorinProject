// Save System - Manages save data operations
import type { SaveSlot, GameState } from '../types';

export class SaveSystem {
  private static readonly SAVE_KEY_PREFIX = 'story-game-save-';
  private static readonly SAVE_SLOTS_KEY = 'story-game-save-slots';
  private static readonly MAX_SAVE_SLOTS = 10;
  private saveSlots: SaveSlot[] = [];

  constructor() {
    this.loadSaveSlots();
  }

  /**
   * ローカルストレージからセーブスロット情報を読み込む
   */
  private loadSaveSlots(): void {
    try {
      const savedSlots = localStorage.getItem(SaveSystem.SAVE_SLOTS_KEY);
      if (savedSlots) {
        this.saveSlots = JSON.parse(savedSlots).map((slot: any) => ({
          ...slot,
          createdAt: new Date(slot.createdAt),
          updatedAt: new Date(slot.updatedAt),
          gameState: {
            ...slot.gameState,
            lastSaved: new Date(slot.gameState.lastSaved)
          }
        }));
      }
    } catch (error) {
      console.error('セーブスロットの読み込みに失敗しました:', error);
      this.saveSlots = [];
    }
  }

  /**
   * セーブスロット情報をローカルストレージに保存する
   */
  private saveSaveSlots(): void {
    try {
      localStorage.setItem(SaveSystem.SAVE_SLOTS_KEY, JSON.stringify(this.saveSlots));
    } catch (error) {
      console.error('セーブスロット情報の保存に失敗しました:', error);
      throw new Error('セーブスロット情報の保存に失敗しました');
    }
  }

  /**
   * 新しいセーブデータを作成する
   * @param slotId セーブスロットID (1-10)
   * @param gameState ゲーム状態
   * @param name セーブデータの名前（オプション）
   */
  async createSave(slotId: number, gameState: GameState, name?: string): Promise<void> {
    if (slotId < 1 || slotId > SaveSystem.MAX_SAVE_SLOTS) {
      throw new Error(`セーブスロットIDは1から${SaveSystem.MAX_SAVE_SLOTS}の間で指定してください`);
    }

    try {
      const now = new Date();
      const updatedGameState = {
        ...gameState,
        lastSaved: now
      };

      // ゲーム状態をローカルストレージに保存
      const saveKey = SaveSystem.SAVE_KEY_PREFIX + slotId;
      localStorage.setItem(saveKey, JSON.stringify(updatedGameState));

      // セーブスロット情報を更新
      const existingSlotIndex = this.saveSlots.findIndex(slot => slot.id === slotId);
      const saveSlot: SaveSlot = {
        id: slotId,
        name: name || `セーブデータ ${slotId}`,
        gameState: updatedGameState,
        createdAt: existingSlotIndex >= 0 ? this.saveSlots[existingSlotIndex].createdAt : now,
        updatedAt: now
      };

      if (existingSlotIndex >= 0) {
        this.saveSlots[existingSlotIndex] = saveSlot;
      } else {
        this.saveSlots.push(saveSlot);
        this.saveSlots.sort((a, b) => a.id - b.id);
      }

      this.saveSaveSlots();
    } catch (error) {
      console.error('セーブデータの作成に失敗しました:', error);
      throw new Error('セーブデータの作成に失敗しました');
    }
  }

  /**
   * セーブデータを読み込む
   * @param slotId セーブスロットID
   * @returns ゲーム状態
   */
  async loadSave(slotId: number): Promise<GameState> {
    if (slotId < 1 || slotId > SaveSystem.MAX_SAVE_SLOTS) {
      throw new Error(`セーブスロットIDは1から${SaveSystem.MAX_SAVE_SLOTS}の間で指定してください`);
    }

    try {
      const saveKey = SaveSystem.SAVE_KEY_PREFIX + slotId;
      const savedData = localStorage.getItem(saveKey);
      
      if (!savedData) {
        throw new Error(`スロット${slotId}にセーブデータが見つかりません`);
      }

      const gameState = JSON.parse(savedData);
      
      // 日付オブジェクトを復元
      gameState.lastSaved = new Date(gameState.lastSaved);
      
      return gameState;
    } catch (error) {
      console.error('セーブデータの読み込みに失敗しました:', error);
      throw new Error('セーブデータの読み込みに失敗しました');
    }
  }

  /**
   * セーブデータを削除する
   * @param slotId セーブスロットID
   */
  async deleteSave(slotId: number): Promise<void> {
    if (slotId < 1 || slotId > SaveSystem.MAX_SAVE_SLOTS) {
      throw new Error(`セーブスロットIDは1から${SaveSystem.MAX_SAVE_SLOTS}の間で指定してください`);
    }

    try {
      const saveKey = SaveSystem.SAVE_KEY_PREFIX + slotId;
      
      // ローカルストレージからセーブデータを削除
      localStorage.removeItem(saveKey);
      
      // セーブスロット情報からも削除
      this.saveSlots = this.saveSlots.filter(slot => slot.id !== slotId);
      this.saveSaveSlots();
    } catch (error) {
      console.error('セーブデータの削除に失敗しました:', error);
      throw new Error('セーブデータの削除に失敗しました');
    }
  }

  /**
   * 利用可能なセーブスロット一覧を取得する
   * @returns セーブスロット配列
   */
  getSaveSlots(): SaveSlot[] {
    return [...this.saveSlots];
  }

  /**
   * 特定のセーブスロットが存在するかチェックする
   * @param slotId セーブスロットID
   * @returns 存在する場合true
   */
  hasSave(slotId: number): boolean {
    return this.saveSlots.some(slot => slot.id === slotId);
  }

  /**
   * 空いているセーブスロットIDを取得する
   * @returns 空いているスロットID、すべて埋まっている場合はnull
   */
  getEmptySlotId(): number | null {
    for (let i = 1; i <= SaveSystem.MAX_SAVE_SLOTS; i++) {
      if (!this.hasSave(i)) {
        return i;
      }
    }
    return null;
  }

  /**
   * セーブデータの総数を取得する
   * @returns セーブデータ数
   */
  getSaveCount(): number {
    return this.saveSlots.length;
  }

  /**
   * 最大セーブスロット数を取得する
   * @returns 最大スロット数
   */
  getMaxSlots(): number {
    return SaveSystem.MAX_SAVE_SLOTS;
  }
}