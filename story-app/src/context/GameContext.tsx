import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { StoryManager } from '../story/StoryManager';
import { SaveSystem } from '../save/SaveSystem';
import { MiniGameSystem } from '../minigames/MiniGameSystem';
import { Story, Scene, GameState, SaveSlot, Choice, GameResult } from '../types';
import { sampleStories } from '../data/sampleStories';

interface GameContextType {
  gameEngine: GameEngine;
  storyManager: StoryManager;
  saveSystem: SaveSystem;
  miniGameSystem: MiniGameSystem;
  currentStory: Story | null;
  currentScene: Scene | null;
  gameState: GameState | null;
  saveSlots: SaveSlot[];
  isLoading: boolean;
  error: string | null;
  isAutoAdvance: boolean;
  highlightElements: boolean;
  toggleAutoAdvance: () => void;
  toggleHighlightElements: () => void;
  updateGameVariables: (newVariables: Record<string, any>) => void;
  loadStory: (storyId: string) => Promise<void>;
  processChoice: (choiceId: string) => void;
  navigateToScene: (sceneId: string) => boolean;
  saveGame: (slotId: number) => Promise<void>;
  loadGame: (slotId: number) => Promise<void>;
  getAvailableStories: () => Story[];
  processMiniGameResult: (result: GameResult) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // 依存関係の初期化
  const storyManagerRef = useRef(new StoryManager());
  const saveSystemRef = useRef(new SaveSystem());
  const miniGameSystemRef = useRef(new MiniGameSystem());
  const gameEngineRef = useRef(new GameEngine(
    storyManagerRef.current,
    saveSystemRef.current,
    miniGameSystemRef.current
  ));

  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoAdvance, setIsAutoAdvance] = useState<boolean>(false);
  const [highlightElements, setHighlightElements] = useState<boolean>(false);

  // 利用可能なストーリーを初期化
  useEffect(() => {
    try {
      // サンプルストーリーをStoryManagerに読み込む
      storyManagerRef.current.loadStories(sampleStories);
      console.log('サンプルストーリーを読み込みました');
    } catch (err) {
      setError('ストーリーの読み込みに失敗しました');
      console.error(err);
    }
    
    // コンポーネントのアンマウント時にリソースをクリーンアップ
    return () => {
      gameEngineRef.current.cleanup();
    };
  }, []);

  // GameEngineの状態変更を監視して、UIの状態を更新
  const updateStateFromGameEngine = () => {
    setCurrentStory(gameEngineRef.current.getCurrentStory());
    setCurrentScene(gameEngineRef.current.getCurrentScene());
    setGameState(gameEngineRef.current.getGameState());
    setIsAutoAdvance(gameEngineRef.current.isAutoAdvanceEnabled());
    setSaveSlots(gameEngineRef.current.getSaveSlots());
  };

  // 利用可能なストーリーを取得する関数
  const getAvailableStories = (): Story[] => {
    return storyManagerRef.current.getAvailableStories();
  };

  const loadStory = async (storyId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // GameEngineを使用してストーリーを読み込む
      await gameEngineRef.current.loadStory(storyId);
      
      // UIの状態を更新
      updateStateFromGameEngine();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ストーリーの読み込みに失敗しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const processChoice = (choiceId: string): void => {
    try {
      // GameEngineを使用して選択肢を処理
      gameEngineRef.current.processChoice(choiceId);
      
      // UIの状態を更新
      updateStateFromGameEngine();
    } catch (err) {
      setError(err instanceof Error ? err.message : '選択肢の処理に失敗しました');
      console.error(err);
    }
  };

  const saveGame = async (slotId: number): Promise<void> => {
    try {
      // GameEngineを使用してゲームを保存
      await gameEngineRef.current.saveGame(slotId);
      
      // UIの状態を更新
      updateStateFromGameEngine();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ゲームの保存に失敗しました');
      console.error(err);
    }
  };

  const loadGame = async (slotId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // GameEngineを使用してゲームをロード
      await gameEngineRef.current.loadGame(slotId);
      
      // UIの状態を更新
      updateStateFromGameEngine();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ゲームのロードに失敗しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToScene = (sceneId: string): boolean => {
    try {
      // GameEngineを使用してシーンに移動
      const success = gameEngineRef.current.navigateToScene(sceneId);
      
      // UIの状態を更新
      updateStateFromGameEngine();
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'シーン遷移に失敗しました');
      console.error(err);
      return false;
    }
  };
  
  // 自動進行モードの切り替え
  const toggleAutoAdvance = (): void => {
    try {
      // GameEngineを使用して自動進行モードを切り替え
      const newState = gameEngineRef.current.toggleAutoAdvance();
      setIsAutoAdvance(newState);
      console.log(`自動進行モード: ${newState ? 'オン' : 'オフ'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '自動進行モードの切り替えに失敗しました');
      console.error(err);
    }
  };
  
  // クリック可能要素のハイライト切り替え
  const toggleHighlightElements = (): void => {
    setHighlightElements(prev => !prev);
    console.log(`要素ハイライトモード: ${!highlightElements ? 'オン' : 'オフ'}`);
  };
  
  // ゲーム変数の更新
  const updateGameVariables = (newVariables: Record<string, any>): void => {
    try {
      // GameEngineを使用してゲーム変数を更新
      gameEngineRef.current.updateGameVariables(newVariables);
      
      // UIの状態を更新
      updateStateFromGameEngine();
      
      console.log('ゲーム変数が更新されました:', newVariables);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ゲーム変数の更新に失敗しました');
      console.error(err);
    }
  };
  
  // ミニゲームの結果を処理
  const processMiniGameResult = (result: GameResult): void => {
    try {
      // GameEngineを使用してミニゲームの結果を処理
      gameEngineRef.current.processMiniGameResult(result);
      
      // UIの状態を更新
      updateStateFromGameEngine();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ミニゲームの結果処理に失敗しました');
      console.error(err);
    }
  };

  const value = {
    gameEngine: gameEngineRef.current,
    storyManager: storyManagerRef.current,
    saveSystem: saveSystemRef.current,
    miniGameSystem: miniGameSystemRef.current,
    currentStory,
    currentScene,
    gameState,
    saveSlots,
    isLoading,
    error,
    isAutoAdvance,
    highlightElements,
    toggleAutoAdvance,
    toggleHighlightElements,
    updateGameVariables,
    loadStory,
    processChoice,
    navigateToScene,
    saveGame,
    loadGame,
    getAvailableStories,
    processMiniGameResult
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContextはGameProvider内で使用する必要があります');
  }
  return context;
};