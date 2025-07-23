import React, { useState, useEffect, useRef } from 'react';
import { Scene, Choice, Character, ClickableElement } from '../types';
import { ChoicesContainer } from './ChoicesContainer';
import { InteractiveElementsManager } from '../utils/InteractiveElementsManager';
import { useGameContext } from '../context/GameContext';
import './StoryScene.css';

interface StorySceneProps {
  scene: Scene;
  onChoiceSelect: (choiceId: string) => void;
  onContinue: () => void;
  textDisplayed: boolean;
  setTextDisplayed: (displayed: boolean) => void;
  gameVariables?: Record<string, any>;
}

export const StoryScene: React.FC<StorySceneProps> = ({ 
  scene, 
  onChoiceSelect, 
  onContinue,
  textDisplayed,
  setTextDisplayed,
  gameVariables = {}
}) => {
  const { isAutoAdvance, highlightElements, updateGameVariables } = useGameContext();
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showClickableElements, setShowClickableElements] = useState<boolean>(false);
  const [showChoices, setShowChoices] = useState<boolean>(false);
  const typingSpeed = 30; // ミリ秒単位でのタイピング速度
  const textRef = useRef<string>(scene.text);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // シーンが変わったときにテキストアニメーションをリセット
  useEffect(() => {
    textRef.current = scene.text;
    setDisplayedText('');
    setIsTyping(true);
    setShowClickableElements(false);
    setShowChoices(false);
    
    // 自動進行タイマーをクリア
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    
    // テキストを徐々に表示するアニメーション
    let index = 0;
    const timer = setInterval(() => {
      if (index < scene.text.length) {
        setDisplayedText(prev => prev + scene.text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        setShowClickableElements(true);
        setTextDisplayed(true);
        
        // テキスト表示完了後、少し遅延して選択肢を表示
        if (scene.choices && scene.choices.length > 0) {
          setTimeout(() => {
            setShowChoices(true);
          }, 500);
        } else if (isAutoAdvance && scene.autoAdvance !== false) {
          // 自動進行が有効で、シーンが自動進行を許可している場合
          autoAdvanceTimerRef.current = setTimeout(() => {
            onContinue();
          }, 3000); // 3秒後に自動進行
        }
      }
    }, typingSpeed);
    
    timerRef.current = timer;
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [scene.id, scene.text, setTextDisplayed, isAutoAdvance, onContinue, scene.autoAdvance]);

  const handleClick = () => {
    // 自動進行タイマーをクリア
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    
    // テキストアニメーション中の場合は、すべてのテキストを表示
    if (isTyping) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setDisplayedText(scene.text);
      setIsTyping(false);
      setShowClickableElements(true);
      setTextDisplayed(true);
      
      // テキスト表示完了後、すぐに選択肢を表示
      if (scene.choices && scene.choices.length > 0) {
        setShowChoices(true);
      } else if (isAutoAdvance && scene.autoAdvance !== false) {
        // 自動進行が有効で、シーンが自動進行を許可している場合
        autoAdvanceTimerRef.current = setTimeout(() => {
          onContinue();
        }, 3000); // 3秒後に自動進行
      }
      return;
    }
    
    // 選択肢がない場合は次のシーンに進む
    if (!scene.choices || scene.choices.length === 0) {
      onContinue();
    }
  };

  // クリック可能な要素をクリックしたときの処理
  const handleElementClick = (element: ClickableElement, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`クリック可能な要素がクリックされました: ${element.id}, アクション: ${element.action}`);
    
    // InteractiveElementsManagerを使用して要素のクリックを処理
    const updatedVariables = InteractiveElementsManager.handleElementClick(element, gameVariables);
    
    // ゲーム変数を更新
    updateGameVariables(updatedVariables);
  };

  // 選択肢が重要な決断かどうかを判断
  const isImportantDecision = (): boolean => {
    if (!scene.choices || scene.choices.length <= 1) return false;
    
    // 選択肢に effects を持つものがあれば重要な決断と見なす
    return scene.choices.some(choice => choice.effects && choice.effects.length > 0);
  };

  return (
    <div 
      className="story-scene" 
      style={{ 
        backgroundImage: scene.background ? `url(${scene.background})` : undefined 
      }}
      onClick={handleClick}
      data-testid="story-scene"
    >
      {/* キャラクター表示 */}
      {scene.characters && scene.characters.map((character: Character) => (
        <div 
          key={character.id}
          className={`character character-${character.position}`}
          style={{ backgroundImage: `url(${character.avatar})` }}
          title={character.name}
          data-testid={`character-${character.id}`}
        />
      ))}
      
      {/* クリック可能な要素 */}
      {showClickableElements && scene.clickableElements && scene.clickableElements
        .filter(element => 
          // 隠し要素の表示条件をチェック
          !element.isHidden || InteractiveElementsManager.shouldShowHiddenElement(element, gameVariables)
        )
        .filter(element => 
          // 条件付き要素の表示条件をチェック
          !element.conditions || InteractiveElementsManager.isElementVisible(element, gameVariables)
        )
        .map((element: ClickableElement) => (
          <div
            key={element.id}
            className={`clickable-element ${highlightElements ? 'highlight' : ''} ${element.isHidden ? 'hidden-element' : ''}`}
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
              width: `${element.width}px`,
              height: `${element.height}px`
            }}
            onClick={(e) => handleElementClick(element, e)}
            title={element.tooltip || ''}
            data-testid={`clickable-${element.id}`}
          />
        ))}
      
      <div className="scene-content">
        <div className="scene-text" data-testid="scene-text">
          {displayedText}
        </div>
        
        {!isTyping && showChoices && scene.choices && scene.choices.length > 0 && (
          <ChoicesContainer 
            choices={scene.choices}
            onChoiceSelect={onChoiceSelect}
            gameVariables={gameVariables}
            isImportantDecision={isImportantDecision()}
          />
        )}
        
        {!isTyping && (!scene.choices || scene.choices.length === 0) && (
          <div className="continue-hint" data-testid="continue-hint">
            クリックして続ける
          </div>
        )}
      </div>
    </div>
  );
};