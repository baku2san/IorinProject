import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ChoicesContainer } from '../components/ChoicesContainer';
import { ChoiceOption } from '../components/ChoiceOption';
import { StoryScene } from '../components/StoryScene';
import { Choice, Scene } from '../types';

// モックデータ
const mockChoices: Choice[] = [
  {
    id: 'choice1',
    text: '選択肢1',
    nextSceneId: 'scene1'
  },
  {
    id: 'choice2',
    text: '選択肢2',
    nextSceneId: 'scene2',
    effects: [
      {
        type: 'variable',
        key: 'reputation',
        value: 10
      }
    ]
  },
  {
    id: 'choice3',
    text: '選択肢3（条件付き）',
    nextSceneId: 'scene3',
    conditions: [
      {
        type: 'variable',
        key: 'hasKey',
        operator: '==',
        value: true
      }
    ]
  }
];

const mockScene: Scene = {
  id: 'test-scene',
  text: 'これはテストシーンです。',
  choices: mockChoices
};

// 条件付き選択肢のテスト用シーン
const mockSceneWithConditions: Scene = {
  id: 'condition-scene',
  text: '条件付き選択肢のテストシーンです。',
  choices: mockChoices
};

describe('選択肢システムのテスト', () => {
  // 個別の選択肢コンポーネントのテスト
  describe('ChoiceOption コンポーネント', () => {
    it('選択肢が正しくレンダリングされること', () => {
      const mockOnSelect = vi.fn();
      render(
        <ChoiceOption 
          choice={mockChoices[0]} 
          onSelect={mockOnSelect} 
        />
      );
      
      expect(screen.getByText('選択肢1')).toBeInTheDocument();
    });
    
    it('選択肢をクリックすると onSelect が呼ばれること', () => {
      const mockOnSelect = vi.fn();
      render(
        <ChoiceOption 
          choice={mockChoices[0]} 
          onSelect={mockOnSelect} 
        />
      );
      
      fireEvent.click(screen.getByText('選択肢1'));
      expect(mockOnSelect).toHaveBeenCalledWith('choice1');
    });
    
    it('重要な選択肢は特別なスタイルでレンダリングされること', () => {
      const mockOnSelect = vi.fn();
      render(
        <ChoiceOption 
          choice={mockChoices[1]} 
          onSelect={mockOnSelect}
          isImportant={true}
        />
      );
      
      const choiceElement = screen.getByText('選択肢2').closest('button');
      expect(choiceElement).toHaveClass('important-choice');
    });
  });
  
  // 選択肢コンテナのテスト
  describe('ChoicesContainer コンポーネント', () => {
    it('すべての選択肢が表示されること', () => {
      const mockOnChoiceSelect = vi.fn();
      render(
        <ChoicesContainer 
          choices={mockChoices} 
          onChoiceSelect={mockOnChoiceSelect}
        />
      );
      
      expect(screen.getByText('選択肢1')).toBeInTheDocument();
      expect(screen.getByText('選択肢2')).toBeInTheDocument();
      expect(screen.getByText('選択肢3（条件付き）')).toBeInTheDocument();
    });
    
    it('条件に基づいて選択肢がフィルタリングされること', () => {
      const mockOnChoiceSelect = vi.fn();
      const gameVariables = { hasKey: false };
      
      render(
        <ChoicesContainer 
          choices={mockChoices} 
          onChoiceSelect={mockOnChoiceSelect}
          gameVariables={gameVariables}
        />
      );
      
      // 条件を満たさない選択肢は表示されないはず
      expect(screen.queryByText('選択肢3（条件付き）')).not.toBeInTheDocument();
      
      // 条件を満たす場合は表示される
      const { rerender } = render(
        <ChoicesContainer 
          choices={mockChoices} 
          onChoiceSelect={mockOnChoiceSelect}
          gameVariables={{ hasKey: true }}
        />
      );
      
      expect(screen.getByText('選択肢3（条件付き）')).toBeInTheDocument();
    });
    
    it('重要な決断の場合、特別なスタイルが適用されること', () => {
      const mockOnChoiceSelect = vi.fn();
      render(
        <ChoicesContainer 
          choices={mockChoices} 
          onChoiceSelect={mockOnChoiceSelect}
          isImportantDecision={true}
        />
      );
      
      const container = screen.getByText('重要な選択').closest('.choices-container');
      expect(container).toHaveClass('important-decision');
    });
  });
  
  // StoryScene 内での選択肢システムの統合テスト
  describe('StoryScene での選択肢システム', () => {
    test('シーン内で選択肢が正しく表示されること', () => {
      const mockOnChoiceSelect = jest.fn();
      const mockOnContinue = jest.fn();
      const mockSetTextDisplayed = jest.fn();
      
      render(
        <StoryScene 
          scene={mockScene}
          onChoiceSelect={mockOnChoiceSelect}
          onContinue={mockOnContinue}
          textDisplayed={true}
          setTextDisplayed={mockSetTextDisplayed}
        />
      );
      
      // テキストが表示された後、選択肢が表示されるまで少し待つ
      setTimeout(() => {
        expect(screen.getByText('選択肢1')).toBeInTheDocument();
        expect(screen.getByText('選択肢2')).toBeInTheDocument();
      }, 600);
    });
    
    test('選択肢をクリックすると onChoiceSelect が呼ばれること', () => {
      const mockOnChoiceSelect = jest.fn();
      const mockOnContinue = jest.fn();
      const mockSetTextDisplayed = jest.fn();
      
      render(
        <StoryScene 
          scene={{
            ...mockScene,
            text: '短いテキスト' // テキストアニメーションを短くするため
          }}
          onChoiceSelect={mockOnChoiceSelect}
          onContinue={mockOnContinue}
          textDisplayed={true}
          setTextDisplayed={mockSetTextDisplayed}
        />
      );
      
      // テキストをクリックしてアニメーションをスキップ
      fireEvent.click(screen.getByTestId('story-scene'));
      
      // 選択肢が表示されるまで少し待つ
      setTimeout(() => {
        fireEvent.click(screen.getByText('選択肢1'));
        expect(mockOnChoiceSelect).toHaveBeenCalledWith('choice1');
      }, 600);
    });
    
    test('条件付き選択肢が gameVariables に基づいて表示/非表示になること', () => {
      const mockOnChoiceSelect = jest.fn();
      const mockOnContinue = jest.fn();
      const mockSetTextDisplayed = jest.fn();
      
      const { rerender } = render(
        <StoryScene 
          scene={mockSceneWithConditions}
          onChoiceSelect={mockOnChoiceSelect}
          onContinue={mockOnContinue}
          textDisplayed={true}
          setTextDisplayed={mockSetTextDisplayed}
          gameVariables={{ hasKey: false }}
        />
      );
      
      // テキストをクリックしてアニメーションをスキップ
      fireEvent.click(screen.getByTestId('story-scene'));
      
      // 選択肢が表示されるまで少し待つ
      setTimeout(() => {
        // 条件を満たさない選択肢は表示されないはず
        expect(screen.queryByText('選択肢3（条件付き）')).not.toBeInTheDocument();
        
        // 条件を満たす場合は表示される
        rerender(
          <StoryScene 
            scene={mockSceneWithConditions}
            onChoiceSelect={mockOnChoiceSelect}
            onContinue={mockOnContinue}
            textDisplayed={true}
            setTextDisplayed={mockSetTextDisplayed}
            gameVariables={{ hasKey: true }}
          />
        );
        
        // テキストをクリックしてアニメーションをスキップ
        fireEvent.click(screen.getByTestId('story-scene'));
        
        setTimeout(() => {
          expect(screen.getByText('選択肢3（条件付き）')).toBeInTheDocument();
        }, 600);
      }, 600);
    });
  });
});