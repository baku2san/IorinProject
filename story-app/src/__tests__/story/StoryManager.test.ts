// StoryManager のテスト
import { StoryManager } from '../../story/StoryManager';
import { Story, Scene, Choice } from '../../types';

describe('StoryManager', () => {
  // テスト用のモックデータ
  const mockStory: Story = {
    id: 'test-story',
    title: 'テストストーリー',
    description: 'テスト用の物語',
    thumbnail: '/test.svg',
    startSceneId: 'scene-1',
    scenes: [
      {
        id: 'scene-1',
        text: '最初のシーン',
        choices: [
          {
            id: 'choice-1',
            text: '選択肢1',
            nextSceneId: 'scene-2'
          },
          {
            id: 'choice-2',
            text: '選択肢2',
            nextSceneId: 'scene-3'
          }
        ]
      },
      {
        id: 'scene-2',
        text: '2番目のシーン',
        choices: [
          {
            id: 'choice-3',
            text: '選択肢3',
            nextSceneId: 'scene-4'
          }
        ]
      },
      {
        id: 'scene-3',
        text: '3番目のシーン',
        choices: [
          {
            id: 'choice-4',
            text: '選択肢4',
            nextSceneId: 'scene-4',
            conditions: [
              {
                type: 'variable',
                key: 'hasKey',
                operator: '==',
                value: true
              }
            ]
          }
        ]
      },
      {
        id: 'scene-4',
        text: '最後のシーン'
      }
    ]
  };

  // 各テストの前に新しいStoryManagerインスタンスを作成
  let storyManager: StoryManager;
  
  beforeEach(() => {
    storyManager = new StoryManager();
  });

  test('初期状態では利用可能な物語が空である', () => {
    expect(storyManager.getAvailableStories()).toEqual([]);
  });

  test('物語を読み込むことができる', () => {
    storyManager.loadStories([mockStory]);
    const stories = storyManager.getAvailableStories();
    
    expect(stories).toHaveLength(1);
    expect(stories[0].id).toBe('test-story');
  });

  test('IDで物語を読み込み、開始シーンに移動できる', () => {
    storyManager.loadStories([mockStory]);
    const result = storyManager.loadStory('test-story');
    
    expect(result).toBe(true);
    expect(storyManager.getCurrentStory()?.id).toBe('test-story');
    expect(storyManager.getCurrentScene()?.id).toBe('scene-1');
  });

  test('存在しない物語IDを読み込もうとすると失敗する', () => {
    storyManager.loadStories([mockStory]);
    const result = storyManager.loadStory('non-existent-story');
    
    expect(result).toBe(false);
  });

  test('シーンIDを指定して取得できる', () => {
    storyManager.loadStories([mockStory]);
    storyManager.loadStory('test-story');
    
    const scene = storyManager.getScene('scene-2');
    expect(scene).not.toBeNull();
    expect(scene?.id).toBe('scene-2');
  });

  test('存在しないシーンIDを指定するとnullが返る', () => {
    storyManager.loadStories([mockStory]);
    storyManager.loadStory('test-story');
    
    const scene = storyManager.getScene('non-existent-scene');
    expect(scene).toBeNull();
  });

  test('選択肢に基づいてシーン遷移ができる', () => {
    storyManager.loadStories([mockStory]);
    storyManager.loadStory('test-story');
    
    const choice: Choice = {
      id: 'choice-1',
      text: '選択肢1',
      nextSceneId: 'scene-2'
    };
    
    const nextScene = storyManager.processSceneTransition(choice);
    expect(nextScene).not.toBeNull();
    expect(nextScene?.id).toBe('scene-2');
    expect(storyManager.getCurrentScene()?.id).toBe('scene-2');
  });

  test('条件を満たさない選択肢ではシーン遷移に失敗する', () => {
    storyManager.loadStories([mockStory]);
    storyManager.loadStory('test-story');
    storyManager.navigateToScene('scene-3');
    
    const choice: Choice = {
      id: 'choice-4',
      text: '選択肢4',
      nextSceneId: 'scene-4',
      conditions: [
        {
          type: 'variable',
          key: 'hasKey',
          operator: '==',
          value: true
        }
      ]
    };
    
    // 条件を満たさない場合
    const gameVariables = { hasKey: false };
    const nextScene = storyManager.processSceneTransition(choice, gameVariables);
    expect(nextScene).toBeNull();
    expect(storyManager.getCurrentScene()?.id).toBe('scene-3');
    
    // 条件を満たす場合
    const gameVariables2 = { hasKey: true };
    const nextScene2 = storyManager.processSceneTransition(choice, gameVariables2);
    expect(nextScene2).not.toBeNull();
    expect(nextScene2?.id).toBe('scene-4');
    expect(storyManager.getCurrentScene()?.id).toBe('scene-4');
  });

  test('指定したシーンに直接移動できる', () => {
    storyManager.loadStories([mockStory]);
    storyManager.loadStory('test-story');
    
    const result = storyManager.navigateToScene('scene-3');
    expect(result).toBe(true);
    expect(storyManager.getCurrentScene()?.id).toBe('scene-3');
  });

  test('存在しないシーンに移動しようとすると失敗する', () => {
    storyManager.loadStories([mockStory]);
    storyManager.loadStory('test-story');
    
    const result = storyManager.navigateToScene('non-existent-scene');
    expect(result).toBe(false);
    // 現在のシーンは変わらない
    expect(storyManager.getCurrentScene()?.id).toBe('scene-1');
  });
});