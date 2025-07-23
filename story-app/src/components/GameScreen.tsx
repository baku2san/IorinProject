import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { StoryScene } from './StoryScene';
import { SaveLoadMenu } from './SaveLoadMenu';
import { Scene } from '../types';
import './GameScreen.css';

interface GameScreenProps {
  onBackToMenu: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBackToMenu }) => {
  const { 
    currentStory, 
    currentScene, 
    processChoice, 
    storyManager,
    navigateToScene,
    isLoading, 
    error,
    gameState
  } = useGameContext();

  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [textDisplayed, setTextDisplayed] = useState<boolean>(true);
  const [showSaveMenu, setShowSaveMenu] = useState<boolean>(false);
  const [showLoadMenu, setShowLoadMenu] = useState<boolean>(false);

  // シーンが変わったときにテキスト表示状態をリセット
  useEffect(() => {
    setTextDisplayed(true);
    setIsTransitioning(false);
  }, [currentScene?.id]);

  const handleChoiceSelect = (choiceId: string) => {
    setIsTransitioning(true);
    processChoice(choiceId);
  };

  // クリックで次のシーンに進む処理
  const handleContinue = () => {
    if (!currentScene || !currentScene.choices || currentScene.choices.length === 0) {
      // 自動進行の場合、次のシーンを探す
      const nextSceneId = findNextSceneId(currentScene);
      if (nextSceneId) {
        setIsTransitioning(true);
        // GameContextのnavigateToSceneメソッドを使用して次のシーンに進む
        const success = storyManager.navigateToScene(nextSceneId);
        if (success) {
          // GameContextの状態を更新
          navigateToScene(nextSceneId);
          console.log(`シーン ${nextSceneId} に進みます`);
          // 少し遅延を入れてから遷移状態を解除
          setTimeout(() => {
            setIsTransitioning(false);
          }, 500);
        } else {
          setIsTransitioning(false);
          console.error(`シーン ${nextSceneId} への遷移に失敗しました`);
        }
      }
    }
  };

  // 次のシーンIDを見つける関数
  const findNextSceneId = (scene: Scene | null): string | null => {
    if (!scene || !currentStory) return null;
    
    // 現在のシーンのインデックスを見つける
    const currentIndex = currentStory.scenes.findIndex(s => s.id === scene.id);
    if (currentIndex >= 0 && currentIndex < currentStory.scenes.length - 1) {
      // 次のシーンを返す
      return currentStory.scenes[currentIndex + 1].id;
    }
    return null;
  };

  if (isLoading || isTransitioning) {
    return (
      <div className="game-screen">
        <h2>読み込み中...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-screen">
        <h2>エラーが発生しました</h2>
        <p>{error}</p>
        <button onClick={onBackToMenu}>メニューに戻る</button>
      </div>
    );
  }

  if (!currentStory || !currentScene) {
    return (
      <div className="game-screen">
        <h2>物語が選択されていません</h2>
        <button onClick={onBackToMenu}>メニューに戻る</button>
      </div>
    );
  }

  return (
    <>
      <div className="game-screen">
        <h2>{currentStory.title}</h2>
        <StoryScene 
          scene={currentScene} 
          onChoiceSelect={handleChoiceSelect}
          onContinue={handleContinue}
          textDisplayed={textDisplayed}
          setTextDisplayed={setTextDisplayed}
          gameVariables={gameState?.gameVariables}
        />
        <div className="game-controls">
          <div className="control-buttons">
            <button 
              onClick={() => setShowSaveMenu(true)} 
              className="control-button"
              title="ゲームを保存"
            >
              セーブ
            </button>
            <button 
              onClick={() => setShowLoadMenu(true)} 
              className="control-button"
              title="ゲームをロード"
            >
              ロード
            </button>
            <button 
              onClick={() => useGameContext().toggleAutoAdvance()} 
              className={`control-button ${useGameContext().isAutoAdvance ? 'active' : ''}`}
              title="自動進行モードの切り替え"
            >
              {useGameContext().isAutoAdvance ? '自動進行: オン' : '自動進行: オフ'}
            </button>
            <button 
              onClick={() => useGameContext().toggleHighlightElements()} 
              className={`control-button ${useGameContext().highlightElements ? 'active' : ''}`}
              title="クリック可能な要素をハイライト"
            >
              {useGameContext().highlightElements ? '要素ハイライト: オン' : '要素ハイライト: オフ'}
            </button>
          </div>
          <button onClick={onBackToMenu} className="menu-button">
            メニューに戻る
          </button>
        </div>
      </div>

      {showSaveMenu && (
        <SaveLoadMenu
          mode="save"
          onClose={() => setShowSaveMenu(false)}
        />
      )}

      {showLoadMenu && (
        <SaveLoadMenu
          mode="load"
          onClose={() => setShowLoadMenu(false)}
        />
      )}
    </>
  );
};