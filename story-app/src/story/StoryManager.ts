// Story Manager - Handles story data and scene transitions
import { Story, Scene, Choice, Condition, Effect } from '../types';

/**
 * StoryManager クラス
 * 物語データの管理とシーン間のナビゲーションを担当します
 */
export class StoryManager {
  private stories: Story[] = [];
  private currentStory: Story | null = null;
  private currentScene: Scene | null = null;

  /**
   * コンストラクタ
   * @param initialStories 初期の物語データ（オプション）
   */
  constructor(initialStories: Story[] = []) {
    this.stories = initialStories;
  }

  /**
   * 利用可能な物語のリストを取得します
   * @returns 物語の配列
   */
  getAvailableStories(): Story[] {
    return this.stories;
  }

  /**
   * 物語データを読み込みます
   * @param stories 物語データの配列
   */
  loadStories(stories: Story[]): void {
    this.stories = stories;
  }

  /**
   * 特定のIDの物語を読み込みます
   * @param storyId 物語ID
   * @returns 読み込みに成功したかどうか
   */
  loadStory(storyId: string): boolean {
    const story = this.stories.find(s => s.id === storyId);
    if (!story) {
      return false;
    }
    
    this.currentStory = story;
    return this.navigateToScene(story.startSceneId);
  }

  /**
   * 指定されたIDのシーンを取得します
   * @param sceneId シーンID
   * @returns シーンオブジェクト、見つからない場合はnull
   */
  getScene(sceneId: string): Scene | null {
    if (!this.currentStory) {
      return null;
    }
    
    const scene = this.currentStory.scenes.find(s => s.id === sceneId);
    return scene || null;
  }

  /**
   * 指定されたシーンに移動します
   * @param sceneId 移動先のシーンID
   * @returns 移動に成功したかどうか
   */
  navigateToScene(sceneId: string): boolean {
    const scene = this.getScene(sceneId);
    if (!scene) {
      return false;
    }
    
    this.currentScene = scene;
    return true;
  }

  /**
   * 選択肢に基づいてシーン遷移を処理します
   * @param choice 選択された選択肢
   * @param gameVariables ゲーム変数（条件チェック用）
   * @returns 次のシーン、遷移に失敗した場合はnull
   */
  processSceneTransition(choice: Choice, gameVariables: Record<string, any> = {}): Scene | null {
    if (!choice || !choice.nextSceneId) {
      return null;
    }
    
    // 条件チェック
    if (choice.conditions && !this.checkConditions(choice.conditions, gameVariables)) {
      return null;
    }
    
    // 選択肢の効果を適用
    if (choice.effects) {
      this.applyChoiceEffects(choice.effects, gameVariables);
    }
    
    // 次のシーンに移動
    if (this.navigateToScene(choice.nextSceneId)) {
      return this.currentScene;
    }
    
    return null;
  }
  
  /**
   * 選択肢の効果を適用します
   * @param effects 適用する効果の配列
   * @param gameVariables 更新するゲーム変数
   */
  private applyChoiceEffects(effects: Effect[], gameVariables: Record<string, any>): void {
    effects.forEach(effect => {
      switch (effect.type) {
        case 'variable':
          // 変数に値を設定
          gameVariables[effect.key] = effect.value;
          break;
        case 'scene':
          // シーン関連の効果（将来的な拡張用）
          break;
        default:
          console.warn(`未知の効果タイプ: ${effect.type}`);
      }
    });
  }

  /**
   * 現在のシーンを取得します
   * @returns 現在のシーン、設定されていない場合はnull
   */
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * 現在の物語を取得します
   * @returns 現在の物語、設定されていない場合はnull
   */
  getCurrentStory(): Story | null {
    return this.currentStory;
  }

  /**
   * 条件が満たされているかチェックします
   * @param conditions チェックする条件の配列
   * @param gameVariables ゲーム変数
   * @returns すべての条件が満たされているかどうか
   */
  private checkConditions(conditions: Condition[], gameVariables: Record<string, any>): boolean {
    return conditions.every(condition => {
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
  }
}