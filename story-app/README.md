# インタラクティブ物語ゲーム

インタラクティブな物語ゲームアプリケーションは、ユーザーが選択肢やクリック操作を通じて物語に参加し、ミニゲームを楽しみながら進行できるシングルプレイヤーゲームです。

## プロジェクト構成

```
story-app/
├── public/                  # 静的ファイル
│   ├── images/              # 物語のサムネイル画像
│   └── backgrounds/         # 背景画像
├── src/
│   ├── assets/              # アセットファイル
│   ├── components/          # UIコンポーネント
│   ├── context/             # Reactコンテキスト
│   ├── data/                # サンプルデータ
│   ├── engine/              # ゲームエンジン
│   ├── minigames/           # ミニゲームシステム
│   ├── save/                # セーブシステム
│   ├── story/               # ストーリー管理
│   ├── types/               # 型定義
│   └── utils/               # ユーティリティ関数
├── App.tsx                  # メインアプリケーション
└── main.tsx                 # エントリーポイント
```

## 技術スタック

- **フロントエンド**: React 19, TypeScript, CSS Modules
- **状態管理**: React Context API
- **ビルドツール**: Vite
- **テスト**: Jest, React Testing Library

## 開発環境のセットアップ

1. 依存関係のインストール:

```bash
npm install
```

2. 開発サーバーの起動:

```bash
npm run dev
```

3. テストの実行:

```bash
npm test
```

4. ビルド:

```bash
npm run build
```

## 主要コンポーネント

### Game Engine

物語の進行とゲーム状態を管理する中核システム。

### Story Manager

物語データの管理と分岐処理を担当。

### Mini-Game System

ミニゲームの実行と結果処理を管理。

### Save System

セーブデータの管理を担当。

## データモデル

- **Story**: 物語全体の情報
- **Scene**: 物語の各シーン
- **Choice**: プレイヤーの選択肢
- **MiniGame**: ミニゲームの定義
- **GameState**: ゲームの状態
- **SaveSlot**: セーブデータのスロット

## 機能

- 複数の物語から選択
- 選択肢による物語分岐
- クリック操作によるインタラクティブ要素
- ミニゲーム
- セーブ・ロード機能