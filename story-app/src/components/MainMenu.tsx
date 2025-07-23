// Main Menu Component
import React, { useState } from 'react';
import { SaveLoadMenu } from './SaveLoadMenu';
import { useGameContext } from '../context/GameContext';
import styles from './MainMenu.module.css';

interface MainMenuProps {
  onStorySelect: () => void;
  onLoadGame: () => void;
  onSettings?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ 
  onStorySelect, 
  onLoadGame,
  onSettings 
}) => {
  const { saveSlots } = useGameContext();
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  const handleLoadGame = () => {
    if (saveSlots.length === 0) {
      alert('セーブデータがありません');
      return;
    }
    setShowLoadMenu(true);
  };

  const handleLoadMenuClose = () => {
    setShowLoadMenu(false);
  };

  return (
    <>
      <div className={styles['main-menu']}>
        <h1 className={styles.title}>インタラクティブ物語ゲーム</h1>
        <p className={styles.subtitle}>選択肢を選んで物語を進めよう！</p>
        <div className={styles['menu-buttons']}>
          <button 
            className={styles['menu-button']} 
            onClick={onStorySelect}
          >
            新しいゲーム
          </button>
          <button 
            className={styles['menu-button']} 
            onClick={handleLoadGame}
          >
            ゲームを続ける ({saveSlots.length}個のセーブデータ)
          </button>
          {onSettings && (
            <button 
              className={styles['menu-button']} 
              onClick={onSettings}
            >
              設定
            </button>
          )}
        </div>
      </div>

      {showLoadMenu && (
        <SaveLoadMenu
          mode="load"
          onClose={handleLoadMenuClose}
        />
      )}
    </>
  );
};