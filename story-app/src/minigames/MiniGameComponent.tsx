// ミニゲームコンポーネントの基底インターフェース
import React from 'react';
import { MiniGameConfig, GameResult } from '../types';
import './MiniGameComponent.css';

export interface MiniGameComponentProps {
  config: MiniGameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  isActive: boolean;
  isPaused: boolean;
  timeRemaining?: number;
}

export interface MiniGameComponentState {
  score: number;
  isStarted: boolean;
  isCompleted: boolean;
  error?: string;
}

// ミニゲームコンポーネントの基底クラス
export abstract class MiniGameComponent<P = {}, S = {}> extends React.Component<
  MiniGameComponentProps & P,
  MiniGameComponentState & S
> {
  protected timer: number | null = null;

  constructor(props: MiniGameComponentProps & P) {
    super(props);
    this.state = {
      score: 0,
      isStarted: false,
      isCompleted: false,
      ...this.getInitialState()
    } as MiniGameComponentState & S;
  }

  // 抽象メソッド - 各ミニゲームで実装が必要
  protected abstract getInitialState(): S;
  protected abstract startGame(): void;
  protected abstract pauseGame(): void;
  protected abstract resumeGame(): void;
  protected abstract resetGame(): void;
  protected abstract renderGameContent(): React.ReactNode;

  componentDidMount(): void {
    if (this.props.isActive) {
      this.handleStart();
    }
  }

  componentDidUpdate(prevProps: MiniGameComponentProps & P): void {
    // アクティブ状態の変化を監視
    if (this.props.isActive !== prevProps.isActive) {
      if (this.props.isActive) {
        this.handleStart();
      } else {
        this.handlePause();
      }
    }

    // 一時停止状態の変化を監視
    if (this.props.isPaused !== prevProps.isPaused) {
      if (this.props.isPaused) {
        this.handlePause();
      } else {
        this.handleResume();
      }
    }
  }

  componentWillUnmount(): void {
    this.clearTimer();
  }

  private handleStart = (): void => {
    if (!this.state.isStarted && !this.state.isCompleted) {
      this.setState({ isStarted: true });
      this.startGame();
    }
  };

  private handlePause = (): void => {
    if (this.state.isStarted && !this.state.isCompleted) {
      this.pauseGame();
    }
  };

  private handleResume = (): void => {
    if (this.state.isStarted && !this.state.isCompleted) {
      this.resumeGame();
    }
  };

  protected handleComplete = (success: boolean, additionalData?: any): void => {
    if (this.state.isCompleted) return;

    this.setState({ isCompleted: true });
    this.clearTimer();

    const result: GameResult = {
      success,
      score: this.state.score,
      data: additionalData
    };

    this.props.onComplete(result);
  };

  protected handleExit = (): void => {
    this.clearTimer();
    this.props.onExit();
  };

  protected updateScore = (newScore: number): void => {
    this.setState({ score: newScore });
  };

  protected setError = (error: string): void => {
    this.setState({ error });
  };

  protected clearError = (): void => {
    this.setState({ error: undefined });
  };

  private clearTimer = (): void => {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  render(): React.ReactNode {
    const { config, timeRemaining } = this.props;
    const { score, isStarted, isCompleted, error } = this.state;

    return (
      <div className="minigame-container">
        <div className="minigame-header">
          <div className="minigame-info">
            <span className="score">スコア: {score}</span>
            {timeRemaining !== undefined && (
              <span className="time">残り時間: {timeRemaining}秒</span>
            )}
            <span className="difficulty">難易度: {config.difficulty}</span>
          </div>
          <button 
            className="exit-button" 
            onClick={this.handleExit}
            disabled={isCompleted}
          >
            終了
          </button>
        </div>

        <div className="minigame-content">
          {error && (
            <div className="error-message">
              エラー: {error}
            </div>
          )}

          {!isStarted && !isCompleted && (
            <div className="start-screen">
              <h3>ミニゲーム</h3>
              <p>難易度: {config.difficulty}</p>
              {config.timeLimit && (
                <p>制限時間: {config.timeLimit}秒</p>
              )}
              <button onClick={this.handleStart}>開始</button>
            </div>
          )}

          {isStarted && !isCompleted && this.renderGameContent()}

          {isCompleted && (
            <div className="completion-screen">
              <h3>ゲーム終了</h3>
              <p>最終スコア: {score}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

// 関数型コンポーネント用のフック
export const useMiniGameState = (initialScore: number = 0) => {
  const [score, setScore] = React.useState(initialScore);
  const [isStarted, setIsStarted] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const updateScore = React.useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const start = React.useCallback(() => {
    setIsStarted(true);
    setIsCompleted(false);
    setError(undefined);
  }, []);

  const complete = React.useCallback(() => {
    setIsCompleted(true);
  }, []);

  const reset = React.useCallback(() => {
    setScore(initialScore);
    setIsStarted(false);
    setIsCompleted(false);
    setError(undefined);
  }, [initialScore]);

  return {
    score,
    isStarted,
    isCompleted,
    error,
    updateScore,
    setError,
    start,
    complete,
    reset
  };
};