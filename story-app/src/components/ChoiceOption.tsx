import React from 'react';
import { Choice } from '../types';
import './ChoiceOption.css';

interface ChoiceOptionProps {
  choice: Choice;
  onSelect: (choiceId: string) => void;
  isImportant?: boolean;
}

export const ChoiceOption: React.FC<ChoiceOptionProps> = ({ 
  choice, 
  onSelect,
  isImportant = false
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(choice.id);
  };

  return (
    <button 
      className={`choice-option ${isImportant ? 'important-choice' : ''}`}
      onClick={handleClick}
      data-testid={`choice-${choice.id}`}
    >
      <div className="choice-content">
        <span className="choice-text">{choice.text}</span>
        {isImportant && (
          <span className="choice-importance-indicator">!</span>
        )}
      </div>
    </button>
  );
};