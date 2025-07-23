// ミニゲーム基底クラス - すべてのミニゲームが継承する基底クラス
import { MiniGameConfig, GameResult } from '../types';

export interface MiniGameProps {
  config: MiniGameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}

export interface MiniGameState {
  isActive: boolean;
  isPaused: boolean;
  timeRemaining?: number;
  score: number;
}

export abstract class BaseMiniGame {
  protected config: MiniGameConfig;
  protected state: MiniGameState;
  protected onComplete: (result: GameResult) => void;
  protected onExit: () => void;

  constructor(props: MiniGameProps) {
    this.config = props.config;
    this.onComplete = props.onComplete;
    this.onExit = props.onExit;
    this.state = {
      isActive: false,
      isPaused: false,
      score: 0,
      timeRemaining: props.config.timeLimit
    };
  }

  // 抽象メソッド - 各ミニゲームで実装が必要
  abstract start(): void;
  abstract pause(): void;
  abstract resume(): void;
  abstract reset(): void;
  abstract getComponent(): React.ComponentType<any>;

  // 共通メソッド
  protected startTimer(): void {
    if (!this.config.timeLimit) return;

    const timer = setInterval(() => {
      if (this.state.isPaused || !this.state.isActive) return;

      if (this.state.timeRemaining && this.state.timeRemaining > 0) {
        this.state.timeRemaining--;
      } else {
        clearInterval(timer);
        this.handleTimeUp();
      }
    }, 1000);
  }

  protected handleTimeUp(): void {
    this.complete({
      success: false,
      score: this.state.score,
      data: { reason: 'timeout' }
    });
  }

  protected complete(result: GameResult): void {
    this.state.isActive = false;
    this.onComplete(result);
  }

  protected exit(): void {
    this.state.isActive = false;
    this.onExit();
  }

  // ゲッター
  getState(): MiniGameState {
    return { ...this.state };
  }

  getConfig(): MiniGameConfig {
    return { ...this.config };
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  isPaused(): boolean {
    return this.state.isPaused;
  }
}