# 設計書

## 概要

インタラクティブな物語ゲームアプリケーションは、ユーザーが選択肢やクリック操作を通じて物語に参加し、ミニゲームを楽しみながら進行できるシングルプレイヤーゲームです。Webベースのアプリケーションとして構築し、ブラウザ上で動作します。

## アーキテクチャ

### 全体構成

```
Frontend (React/TypeScript)
├── Game Engine
├── Story Manager
├── Mini-Game System
├── Save System
└── UI Components

Backend (Node.js/Express)
├── Story Data API
├── Save Data Management
└── Static File Serving
```

### 技術スタック

- **フロントエンド**: React 18, TypeScript, CSS Modules
- **バックエンド**: Node.js, Express
- **データベース**: JSON ファイル（開発用）、将来的にSQLite
- **状態管理**: React Context API
- **ビルドツール**: Vite
- **テスト**: Jest, React Testing Library

## コンポーネントとインターフェース

### 1. Game Engine

物語の進行とゲーム状態を管理する中核システム

```typescript
interface GameEngine {
  currentStory: Story;
  gameState: GameState;
  loadStory(storyId: string): Promise<void>;
  processChoice(choiceId: string): void;
  saveGame(slotId: number): Promise<void>;
  loadGame(slotId: number): Promise<void>;
}
```

### 2. Story Manager

物語データの管理と分岐処理

```typescript
interface StoryManager {
  stories: Story[];
  currentScene: Scene;
  getAvailableStories(): Story[];
  getScene(sceneId: string): Scene;
  processSceneTransition(choice: Choice): Scene;
}
```

### 3. Mini-Game System

ミニゲームの実行と結果処理

```typescript
interface MiniGameSystem {
  availableGames: MiniGame[];
  currentGame: MiniGame | null;
  startMiniGame(gameType: string): void;
  processGameResult(result: GameResult): void;
  getMiniGameComponent(gameType: string): React.Component;
}
```

### 4. Save System

セーブデータの管理

```typescript
interface SaveSystem {
  saveSlots: SaveSlot[];
  createSave(slotId: number, gameState: GameState): Promise<void>;
  loadSave(slotId: number): Promise<GameState>;
  deleteSave(slotId: number): Promise<void>;
  getSaveSlots(): SaveSlot[];
}
```

## データモデル

### Story（物語）

```typescript
interface Story {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  scenes: Scene[];
  startSceneId: string;
}
```

### Scene（シーン）

```typescript
interface Scene {
  id: string;
  text: string;
  background?: string;
  characters?: Character[];
  choices?: Choice[];
  miniGame?: MiniGameTrigger;
  autoAdvance?: boolean;
  clickableElements?: ClickableElement[];
}
```

### Choice（選択肢）

```typescript
interface Choice {
  id: string;
  text: string;
  nextSceneId: string;
  conditions?: Condition[];
  effects?: Effect[];
}
```

### MiniGame（ミニゲーム）

```typescript
interface MiniGame {
  id: string;
  type: 'puzzle' | 'reflex' | 'memory' | 'quiz';
  config: MiniGameConfig;
  successScene: string;
  failureScene: string;
  retryAllowed: boolean;
}
```

### GameState（ゲーム状態）

```typescript
interface GameState {
  storyId: string;
  currentSceneId: string;
  playerChoices: string[];
  gameVariables: Record<string, any>;
  completedMiniGames: string[];
  playTime: number;
  lastSaved: Date;
}
```

## エラーハンドリング

### エラータイプ

1. **Story Loading Errors**: 物語データの読み込み失敗
2. **Save/Load Errors**: セーブデータの操作失敗
3. **Mini-Game Errors**: ミニゲーム実行中のエラー
4. **Network Errors**: API通信エラー

### エラー処理戦略

- ユーザーフレンドリーなエラーメッセージの表示
- 自動リトライ機能（ネットワークエラー）
- フォールバック機能（デフォルトシーンへの復帰）
- エラーログの記録

## テスト戦略

### 単体テスト

- 各コンポーネントの独立したテスト
- データモデルの検証
- ユーティリティ関数のテスト

### 統合テスト

- Game Engineと各システムの連携テスト
- API通信のテスト
- セーブ/ロード機能のテスト

### E2Eテスト

- 物語の開始から終了までの完全なフロー
- 選択肢による分岐の検証
- ミニゲームの動作確認

### テストシナリオ

1. 物語の選択と開始
2. 選択肢による物語分岐
3. ミニゲームの実行と結果処理
4. セーブ/ロード機能
5. エラー状況での復旧

## パフォーマンス考慮事項

### 最適化戦略

- 物語データの遅延読み込み
- 画像の最適化とプリロード
- コンポーネントのメモ化
- 不要な再レンダリングの防止

### メモリ管理

- 使用していないシーンデータの解放
- ミニゲームリソースの適切な管理
- セーブデータのキャッシュ制御

## セキュリティ

### データ保護

- セーブデータの暗号化（将来的）
- XSS攻撃の防止
- 入力値の検証

### アクセス制御

- 不正なAPI呼び出しの防止
- セーブデータの改ざん検出