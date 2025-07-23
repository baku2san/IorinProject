// Mini-Game System - Manages mini-games execution and results
import { MiniGame, GameResult, MiniGameConfig } from '../types';
import { BaseMiniGame, MiniGameProps } from './BaseMiniGame';

export interface MiniGameSystemCallbacks {
  onGameComplete: (result: GameResult) => void;
  onGameExit: () => void;
  onSceneTransition: (sceneId: string) => void;
}

export class MiniGameSystem {
  private availableGames: Map<string, MiniGame> = new Map();
  private currentGame: MiniGame | null = null;
  private currentGameInstance: BaseMiniGame | null = null;
  private callbacks: MiniGameSystemCallbacks;

  constructor(callbacks: MiniGameSystemCallbacks) {
    this.callbacks = callbacks;
    this.initializeAvailableGames();
  }

  private initializeAvailableGames(): void {
    // 利用可能なミニゲームを登録
    // 実際のゲームは後で追加される
  }

  registerMiniGame(game: MiniGame): void {
    this.availableGames.set(game.id, game);
  }

  startMiniGame(gameId: string, config?: Partial<MiniGameConfig>): boolean {
    const game = this.availableGames.get(gameId);
    if (!game) {
      console.error(`Mini-game with id "${gameId}" not found`);
      return false;
    }

    // 既存のゲームが実行中の場合は終了
    if (this.currentGameInstance) {
      this.endCurrentGame();
    }

    this.currentGame = game;

    // 設定をマージ
    const finalConfig = { ...game.config, ...config };

    // ゲームインスタンスを作成
    const gameProps: MiniGameProps = {
      config: finalConfig,
      onComplete: (result: GameResult) => this.handleGameComplete(result),
      onExit: () => this.handleGameExit()
    };

    try {
      this.currentGameInstance = this.createGameInstance(game.type, gameProps);
      this.currentGameInstance.start();
      return true;
    } catch (error) {
      console.error('Failed to start mini-game:', error);
      this.currentGame = null;
      return false;
    }
  }

  private createGameInstance(gameType: string, props: MiniGameProps): BaseMiniGame {
    // ゲームタイプに応じてインスタンスを作成
    // 現在は基底クラスのみなので、後で具体的なゲームクラスを追加
    switch (gameType) {
      case 'puzzle':
        // return new PuzzleGame(props);
        break;
      case 'reflex':
        // return new ReflexGame(props);
        break;
      case 'memory':
        // return new MemoryGame(props);
        break;
      case 'quiz':
        // return new QuizGame(props);
        break;
      default:
        throw new Error(`Unsupported game type: ${gameType}`);
    }
    
    // 一時的な実装 - 後で削除
    throw new Error(`Game type "${gameType}" not implemented yet`);
  }

  private handleGameComplete(result: GameResult): void {
    if (!this.currentGame) return;

    // ゲーム結果を処理
    this.processGameResult(result);

    // コールバックを呼び出し
    this.callbacks.onGameComplete(result);

    // 結果に基づいてシーン遷移
    const nextSceneId = result.success 
      ? this.currentGame.successScene 
      : this.currentGame.failureScene;

    this.callbacks.onSceneTransition(nextSceneId);

    // 現在のゲームをクリア
    this.endCurrentGame();
  }

  private handleGameExit(): void {
    this.callbacks.onGameExit();
    this.endCurrentGame();
  }

  private endCurrentGame(): void {
    this.currentGame = null;
    this.currentGameInstance = null;
  }

  processGameResult(result: GameResult): void {
    if (!this.currentGame) return;

    // ゲーム結果をログに記録
    console.log('Mini-game completed:', {
      gameId: this.currentGame.id,
      success: result.success,
      score: result.score,
      data: result.data
    });

    // 必要に応じて追加の処理を実行
    // 例: 統計の更新、実績の解除など
  }

  getMiniGameComponent(gameType: string): React.ComponentType<any> | null {
    if (!this.currentGameInstance) return null;
    
    try {
      return this.currentGameInstance.getComponent();
    } catch (error) {
      console.error('Failed to get mini-game component:', error);
      return null;
    }
  }

  pauseCurrentGame(): boolean {
    if (!this.currentGameInstance) return false;
    
    try {
      this.currentGameInstance.pause();
      return true;
    } catch (error) {
      console.error('Failed to pause mini-game:', error);
      return false;
    }
  }

  resumeCurrentGame(): boolean {
    if (!this.currentGameInstance) return false;
    
    try {
      this.currentGameInstance.resume();
      return true;
    } catch (error) {
      console.error('Failed to resume mini-game:', error);
      return false;
    }
  }

  resetCurrentGame(): boolean {
    if (!this.currentGameInstance) return false;
    
    try {
      this.currentGameInstance.reset();
      return true;
    } catch (error) {
      console.error('Failed to reset mini-game:', error);
      return false;
    }
  }

  canRetry(): boolean {
    return this.currentGame?.retryAllowed ?? false;
  }

  retryCurrentGame(): boolean {
    if (!this.currentGame || !this.canRetry()) return false;
    
    return this.startMiniGame(this.currentGame.id);
  }

  getCurrentGame(): MiniGame | null {
    return this.currentGame;
  }

  getCurrentGameState(): any {
    return this.currentGameInstance?.getState() ?? null;
  }

  getAvailableGames(): MiniGame[] {
    return Array.from(this.availableGames.values());
  }

  isGameActive(): boolean {
    return this.currentGameInstance?.isActive() ?? false;
  }
}