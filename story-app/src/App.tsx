import React, { useState } from 'react';
import './App.css';
import { GameProvider } from './context/GameContext';
import { MainMenu } from './components/MainMenu';
import { StorySelection } from './components/StorySelection';
import { GameScreen } from './components/GameScreen';
import { sampleStories } from './data/sampleStories';
import { useGameContext } from './context/GameContext';

// Wrapper component to use context
const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'story-selection' | 'game'>('menu');
  const { loadStory } = useGameContext();
  
  const handleStorySelect = async (storyId: string) => {
    console.log(`選択されたストーリー: ${storyId}`);
    await loadStory(storyId);
    setCurrentScreen('game');
  };
  
  const handleLoadGame = () => {
    console.log('セーブデータを読み込み中');
    // 実際のアプリでは、ここでセーブスロットを表示し
    // 選択されたセーブデータを読み込みます
  };
  
  const handleShowStorySelection = () => {
    setCurrentScreen('story-selection');
  };
  
  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };
  
  const handleSettings = () => {
    console.log('設定画面を表示');
    // 将来的に設定画面を実装する予定
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>インタラクティブ物語ゲーム</h1>
      </header>
      <main className="app-main">
        {currentScreen === 'menu' && (
          <MainMenu 
            onStorySelect={handleShowStorySelection}
            onLoadGame={handleLoadGame}
            onSettings={handleSettings}
          />
        )}
        
        {currentScreen === 'story-selection' && (
          <StorySelection 
            stories={sampleStories} 
            onStorySelect={handleStorySelect}
            onBack={handleBackToMenu}
          />
        )}
        
        {currentScreen === 'game' && (
          <GameScreen onBackToMenu={handleBackToMenu} />
        )}
      </main>
    </div>
  );
};

// Main App component with provider
function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
