import React from 'react';
import { Choice, Condition } from '../types';
import { ChoiceOption } from './ChoiceOption';
import './ChoicesContainer.css';

interface ChoicesContainerProps {
  choices: Choice[];
  onChoiceSelect: (choiceId: string) => void;
  gameVariables?: Record<string, any>;
  isImportantDecision?: boolean;
}

export const ChoicesContainer: React.FC<ChoicesContainerProps> = ({
  choices,
  onChoiceSelect,
  gameVariables = {},
  isImportantDecision = false
}) => {
  // 条件に基づいて選択肢をフィルタリングする関数
  const isChoiceAvailable = (choice: Choice): boolean => {
    if (!choice.conditions || choice.conditions.length === 0) {
      return true;
    }

    return choice.conditions.every(condition => {
      const value = condition.type === 'variable' ? gameVariables[condition.key] : null;
      
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
  };

  // 利用可能な選択肢をフィルタリング
  const availableChoices = choices.filter(isChoiceAvailable);

  // 選択肢が重要かどうかを判断する関数
  const isImportantChoice = (choice: Choice): boolean => {
    // 選択肢に effects がある場合は重要と見なす
    return Boolean(choice.effects && choice.effects.length > 0);
  };

  return (
    <div className={`choices-container ${isImportantDecision ? 'important-decision' : ''}`}>
      {isImportantDecision && (
        <div className="important-decision-header">
          <span className="important-icon">!</span>
          <h3>重要な選択</h3>
          <span className="important-icon">!</span>
        </div>
      )}
      
      {availableChoices.length > 0 ? (
        availableChoices.map(choice => (
          <ChoiceOption
            key={choice.id}
            choice={choice}
            onSelect={onChoiceSelect}
            isImportant={isImportantChoice(choice) || isImportantDecision}
          />
        ))
      ) : (
        <div className="no-choices-message">
          選択肢がありません
        </div>
      )}
    </div>
  );
};