// Game Engine - Core game logic and state management
import { Story, GameState, Scene, Choice, Condition, Effect, GameResult, SaveSlot } from '../types';
import { StoryManager } from '../story/StoryManager';
import { SaveSystem } from '../save/SaveSystem';
import { MiniGameSystem } from '../minigames/MiniGameSystem';

/**
 * GameEngine クラス
 * ゲームの中核ロジックと状態管理を担当します
 */
export class GameEngine {
  private storyManager: StoryManager;
  private saveSystem: SaveSystem;
  private miniGameSystem: MiniGameSystem;
  private currentStory: Story | null = null;
  private gameState: GameState | null = null;
  private isAutoAdvance: boolean = false;
  private playTimeInterval: number | null = null;

  /**
   * コンストラクタ
   * @param storyManager StoryManagerのインスタンス
   * @param saveSystem SaveSystemのインスタンス
   * @param miniGameSystem MiniGameSystemのインスタンス
   */
  constructor(
    storyManager?: StoryManager,
    saveSystem?: SaveSystem,
    miniGameSystem?: MiniGameSystem
  ) {
    this.storyManager = storyManager || new StoryManager();
    this.saveSystem = saveSystem || new SaveSystem();
    
    // MiniGameSystemのコールバックを設定
    const miniGameCallbacks = {
      onGameComplete: (result: GameResult) => this.processMiniGameResult(result),
      onGameExit: () => this.handleMiniGameExit(),
      onSceneTransition: (sceneId: string) => this.navigateToScene(sceneId)
    };
    
    this.miniGameSystem = miniGameSystem || new MiniGameSystem(miniGameCallbacks);
  }

  /**
   * 物語を読み込みます
   * @param storyId 読み込む物語のID
   * @returns Promise<void>
   * @throws 物語が見つからない場合にエラーをスローします
   */
  async loadStory(storyId: string): Promise<void> {
    try {
      // StoryManagerを使用して物語を読み込む
      const success = this.storyManager.loadStory(storyId);
      if (!success) {
        throw new Error(`ID ${storyId} の物語が見つかりません`);
      }
      
      // 現在の物語とシーンを取得
      this.currentStory = this.storyManager.getCurrentStory();
      const currentScene = this.storyManager.getCurrentScene();
      
      if (!this.currentStory || !currentScene) {
        throw new Error('物語またはシーンの読み込みに失敗しました');
      }
      
      // ゲーム状態を初期化
      this.gameState = {
        storyId: this.currentStory.id,
        currentSceneId: currentScene.id,
        playerChoices: [],
        gameVariables: {},
        completedMiniGames: [],
        playTime: 0,
        lastSaved: new Date()
      };
      
      // プレイ時間の計測を開始
      this.startPlayTimeTracking();
    } catch (error) {
      console.error('物語の読み込み中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 選択肢を処理します
   * @param choiceId 選択肢のID
   * @throws ゲーム状態が初期化されていない場合、または選択肢が見つからない場合にエラーをスローします
   */
  processChoice(choiceId: string): void {
    if (!this.gameState) {
      throw new Error('ゲーム状態が初期化されていません');
    }
    
    const currentScene = this.storyManager.getCurrentScene();
    if (!currentScene) {
      throw new Error('現在のシーンが設定されていません');
    }
    
    // 選択された選択肢を見つける
    const choice = currentScene.choices?.find(c => c.id === choiceId);
    if (!choice) {
      throw new Error(`ID ${choiceId} の選択肢が見つかりません`);
    }
    
    // 選択肢の条件をチェック
    if (choice.conditions && !this.checkConditions(choice.conditions)) {
      throw new Error('選択肢の条件が満たされていません');
    }
    
    // 選択肢の効果を適用
    if (choice.effects) {
      this.applyEffects(choice.effects);
    }
    
    // シーン遷移を処理
    const nextScene = this.storyManager.processSceneTransition(choice, this.gameState.gameVariables);
    if (!nextScene) {
      throw new Error(`選択肢 ${choiceId} による遷移に失敗しました`);
    }
    
    // ゲーム状態を更新
    this.gameState = {
      ...this.gameState,
      currentSceneId: nextScene.id,
      playerChoices: [...this.gameState.playerChoices, choiceId]
    };
    
    // ミニゲームのトリガーをチェック
    this.checkMiniGameTrigger(nextScene);
  }

  /**
   * 指定されたシーンに移動します
   * @param sceneId 移動先のシーンID
   * @returns 移動に成功したかどうか
   */
  navigateToScene(sceneId: string): boolean {
    if (!this.gameState) {
      throw new Error('ゲーム状態が初期化されていません');
    }
    
    // StoryManagerを使用してシーンに移動
    const success = this.storyManager.navigateToScene(sceneId);
    if (!success) {
      return false;
    }
    
    // 現在のシーンを取得
    const nextScene = this.storyManager.getCurrentScene();
    if (!nextScene) {
      return false;
    }
    
    // ゲーム状態を更新
    this.gameState = {
      ...this.gameState,
      currentSceneId: nextScene.id
    };
    
    // ミニゲームのトリガーをチェック
    this.checkMiniGameTrigger(nextScene);
    
    return true;
  }

  /**
   * ゲームをセーブします
   * @param slotId セーブスロットのID
   * @returns Promise<void>
   * @throws ゲーム状態が初期化されていない場合にエラーをスローします
   */
  async saveGame(slotId: number): Promise<void> {
    if (!this.gameState) {
      throw new Error('ゲーム状態が初期化されていません');
    }
    
    // 最終保存時間を更新
    this.gameState = {
      ...this.gameState,
      lastSaved: new Date()
    };
    
    try {
      // SaveSystemを使用してゲームを保存
      await this.saveSystem.createSave(slotId, this.gameState);
    } catch (error) {
      console.error('ゲームの保存中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * ゲームをロードします
   * @param slotId ロードするセーブスロットのID
   * @returns Promise<void>
   * @throws セーブデータが見つからない場合にエラーをスローします
   */
  async loadGame(slotId: number): Promise<void> {
    try {
      // SaveSystemを使用してゲームをロード
      const loadedGameState = await this.saveSystem.loadSave(slotId);
      
      // 物語を読み込む
      const success = this.storyManager.loadStory(loadedGameState.storyId);
      if (!success) {
        throw new Error(`ID ${loadedGameState.storyId} の物語が見つかりません`);
      }
      
      // 現在の物語を設定
      this.currentStory = this.storyManager.getCurrentStory();
      
      // シーンに移動
      const sceneSuccess = this.storyManager.navigateToScene(loadedGameState.currentSceneId);
      if (!sceneSuccess) {
        throw new Error(`ID ${loadedGameState.currentSceneId} のシーンが見つかりません`);
      }
      
      // ゲーム状態を設定
      this.gameState = loadedGameState;
      
      // プレイ時間の計測を開始
      this.startPlayTimeTracking();
    } catch (error) {
      console.error('ゲームのロード中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * ミニゲームの結果を処理します
   * @param result ミニゲームの結果
   * @throws ゲーム状態が初期化されていない場合、または現在のミニゲームが設定されていない場合にエラーをスローします
   */
  processMiniGameResult(result: GameResult): void {
    if (!this.gameState) {
      throw new Error('ゲーム状態が初期化されていません');
    }
    
    const currentGame = this.miniGameSystem.getCurrentGame();
    if (!currentGame) {
      throw new Error('現在のミニゲームが設定されていません');
    }
    
    // ミニゲームの結果をゲーム変数に保存
    const gameResultKey = `minigame_${currentGame.id}_result`;
    const gameScoreKey = `minigame_${currentGame.id}_score`;
    
    this.updateGameVariables({
      [gameResultKey]: result.success,
      [gameScoreKey]: result.score || 0,
      [`minigame_${currentGame.id}_data`]: result.data
    });
    
    // 成功した場合、完了したミニゲームリストに追加
    if (result.success) {
      this.gameState = {
        ...this.gameState,
        completedMiniGames: [...this.gameState.completedMiniGames, currentGame.id]
      };
    }
    
    // ミニゲームの結果に基づいて次のシーンに移動
    const nextSceneId = result.success ? currentGame.successScene : currentGame.failureScene;
    this.navigateToScene(nextSceneId);
  }

  /**
   * ミニゲーム終了時の処理
   * @private
   */
  private handleMiniGameExit(): void {
    // ミニゲームが途中で終了された場合の処理
    console.log('ミニゲームが終了されました');
    // 必要に応じて特定のシーンに戻るなどの処理を追加
  }

  /**
   * 自動進行モードを切り替えます
   * @returns 新しい自動進行モードの状態
   */
  toggleAutoAdvance(): boolean {
    this.isAutoAdvance = !this.isAutoAdvance;
    return this.isAutoAdvance;
  }

  /**
   * ゲーム変数を更新します
   * @param newVariables 新しいゲーム変数
   * @throws ゲーム状態が初期化されていない場合にエラーをスローします
   */
  updateGameVariables(newVariables: Record<string, any>): void {
    if (!this.gameState) {
      throw new Error('ゲーム状態が初期化されていません');
    }
    
    this.gameState = {
      ...this.gameState,
      gameVariables: {
        ...this.gameState.gameVariables,
        ...newVariables
      }
    };
  }

  /**
   * 現在の物語を取得します
   * @returns 現在の物語、設定されていない場合はnull
   */
  getCurrentStory(): Story | null {
    return this.currentStory;
  }

  /**
   * 現在のシーンを取得します
   * @returns 現在のシーン、設定されていない場合はnull
   */
  getCurrentScene(): Scene | null {
    return this.storyManager.getCurrentScene();
  }

  /**
   * ゲーム状態を取得します
   * @returns 現在のゲーム状態、設定されていない場合はnull
   */
  getGameState(): GameState | null {
    return this.gameState;
  }

  /**
   * 自動進行モードの状態を取得します
   * @returns 自動進行モードが有効かどうか
   */
  isAutoAdvanceEnabled(): boolean {
    return this.isAutoAdvance;
  }

  /**
   * 利用可能なセーブスロットを取得します
   * @returns セーブスロットの配列
   */
  getSaveSlots(): SaveSlot[] {
    return this.saveSystem.getSaveSlots();
  }

  /**
   * プレイ時間の計測を開始します
   * @private
   */
  private startPlayTimeTracking(): void {
    // 既存のインターバルをクリア
    if (this.playTimeInterval !== null) {
      clearInterval(this.playTimeInterval);
    }
    
    // 1秒ごとにプレイ時間を更新
    this.playTimeInterval = window.setInterval(() => {
      if (this.gameState) {
        this.gameState = {
          ...this.gameState,
          playTime: this.gameState.playTime + 1
        };
      }
    }, 1000);
  }

  /**
   * プレイ時間の計測を停止します
   * @private
   */
  private stopPlayTimeTracking(): void {
    if (this.playTimeInterval !== null) {
      clearInterval(this.playTimeInterval);
      this.playTimeInterval = null;
    }
  }

  /**
   * 条件が満たされているかチェックします
   * @param conditions チェックする条件の配列
   * @returns すべての条件が満たされているかどうか
   * @private
   */
  private checkConditions(conditions: Condition[]): boolean {
    if (!this.gameState) {
      return false;
    }
    
    return conditions.every(condition => {
      let value: any;
      
      switch (condition.type) {
        case 'variable':
          value = this.gameState?.gameVariables[condition.key];
          break;
        case 'choice':
          value = this.gameState?.playerChoices.includes(condition.key);
          break;
        case 'minigame':
          value = this.gameState?.completedMiniGames.includes(condition.key);
          break;
        default:
          return false;
      }
      
      switch (condition.operator) {
        case '==':
          return value === condition.value;
        case '!=':
          return value !== condition.value;
        case '>':
          return value > condition.value;
        case '<':
          return value < condition.value;
        case '>=':
          return value >= condition.value;
        case '<=':
          return value <= condition.value;
        default:
          return false;
      }
    });
  }

  /**
   * 効果を適用します
   * @param effects 適用する効果の配列
   * @private
   */
  private applyEffects(effects: Effect[]): void {
    if (!this.gameState) {
      return;
    }
    
    const updatedVariables = { ...this.gameState.gameVariables };
    
    effects.forEach(effect => {
      switch (effect.type) {
        case 'variable':
          // 変数に値を設定
          updatedVariables[effect.key] = effect.value;
          break;
        case 'scene':
          // シーン関連の効果（将来的な拡張用）
          break;
        default:
          console.warn(`未知の効果タイプ: ${effect.type}`);
      }
    });
    
    // ゲーム変数を更新
    this.gameState = {
      ...this.gameState,
      gameVariables: updatedVariables
    };
  }

  /**
   * シーンのミニゲームトリガーをチェックします
   * @param scene チェックするシーン
   * @private
   */
  private checkMiniGameTrigger(scene: Scene): void {
    if (!scene.miniGame || !this.gameState) {
      return;
    }
    
    // 条件チェック
    if (scene.miniGame.condition && !this.checkConditions([scene.miniGame.condition])) {
      return;
    }
    
    // ミニゲームを開始
    try {
      this.miniGameSystem.startMiniGame(scene.miniGame.gameId);
    } catch (error) {
      console.error('ミニゲームの開始中にエラーが発生しました:', error);
    }
  }

  /**
   * リソースをクリーンアップします
   */
  cleanup(): void {
    this.stopPlayTimeTracking();
  }
}