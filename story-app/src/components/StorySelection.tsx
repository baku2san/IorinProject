// Story Selection Component
import React from 'react';
import { Story } from '../types';
import styles from './StorySelection.module.css';

interface StorySelectionProps {
  stories: Story[];
  onStorySelect: (storyId: string) => void;
  onBack: () => void;
}

export const StorySelection: React.FC<StorySelectionProps> = ({ 
  stories, 
  onStorySelect, 
  onBack 
}) => {
  return (
    <div className={styles['story-selection']}>
      <h2 className={styles.title}>物語を選択してください</h2>
      <div className={styles['story-list']}>
        {stories.map((story) => (
          <div key={story.id} className={styles['story-card']}>
            <img 
              src={story.thumbnail} 
              alt={story.title} 
              className={styles.thumbnail}
            />
            <h3 className={styles['story-title']}>{story.title}</h3>
            <p className={styles['story-description']}>{story.description}</p>
            <button 
              className={styles['start-button']} 
              onClick={() => onStorySelect(story.id)}
            >
              開始
            </button>
          </div>
        ))}
      </div>
      <button className={styles['back-button']} onClick={onBack}>
        メニューに戻る
      </button>
    </div>
  );
};