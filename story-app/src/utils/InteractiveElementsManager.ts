// インタラクティブ要素を管理するユーティリティクラス
import { ClickableElement, Effect } from '../types';

/**
 * インタラクティブ要素マネージャー
 * クリック可能な要素の検出と処理を担当します
 */
export class InteractiveElementsManager {
  /**
   * クリック可能な要素がクリックされたときの処理
   * @param element クリックされた要素
   * @param gameVariables ゲーム変数
   * @returns 更新されたゲーム変数
   */
  static handleElementClick(
    element: ClickableElement,
    gameVariables: Record<string, any>
  ): Record<string, any> {
    console.log(`クリック可能な要素がクリックされました: ${element.id}, アクション: ${element.action}`);
    
    // アクションに基づいて処理を実行
    const updatedVariables = { ...gameVariables };
    
    // アクションタイプに基づいて異なる処理を実行
    switch (element.action) {
      case 'examine':
        // 調査アクション
        updatedVariables[`examined_${element.id}`] = true;
        break;
      case 'collect':
        // アイテム収集アクション
        updatedVariables[`collected_${element.id}`] = true;
        break;
      case 'toggle':
        // 状態切り替えアクション
        updatedVariables[`toggled_${element.id}`] = !updatedVariables[`toggled_${element.id}`];
        break;
      default:
        // カスタムアクション（アクション名をキーとして記録）
        updatedVariables[element.action] = true;
        break;
    }
    
    // 要素に関連する効果があれば適用
    if (element.effects) {
      element.effects.forEach((effect: Effect) => {
        if (effect.type === 'variable') {
          updatedVariables[effect.key] = effect.value;
        }
      });
    }
    
    return updatedVariables;
  }
  
  /**
   * 要素が表示可能かどうかを判断
   * @param element クリック可能な要素
   * @param gameVariables ゲーム変数
   * @returns 表示可能かどうか
   */
  static isElementVisible(
    element: ClickableElement,
    gameVariables: Record<string, any>
  ): boolean {
    // 要素に表示条件がない場合は常に表示
    if (!element.conditions) {
      return true;
    }
    
    // すべての条件を満たす場合のみ表示
    return element.conditions.every(condition => {
      const value = gameVariables[condition.key];
      
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
  
  /**
   * 隠し要素を表示するかどうかを判断
   * @param element クリック可能な要素
   * @param gameVariables ゲーム変数
   * @returns 隠し要素を表示するかどうか
   */
  static shouldShowHiddenElement(
    element: ClickableElement,
    gameVariables: Record<string, any>
  ): boolean {
    // 隠し要素でない場合は常に表示
    if (!element.isHidden) {
      return true;
    }
    
    // 特定の条件を満たした場合のみ表示
    // 例: 特定のアイテムを持っている場合や特定のシーンを訪れた場合
    const requiredVariable = element.visibilityKey || `reveal_${element.id}`;
    return !!gameVariables[requiredVariable];
  }
}