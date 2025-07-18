# OpenAI API キーの設定方法

## 1. 環境変数ファイルの作成

プロジェクトのルートディレクトリに `.env` ファイルを作成してください：

```bash
touch .env
```

## 2. APIキーの追加

`.env` ファイルに以下の内容を追加してください：

```
VITE_OPENAI_API_KEY=sk-あなたのAPIキーをここに入力
```

例：
```
VITE_OPENAI_API_KEY=sk-1234567890abcdef...
```

## 3. APIキーの取得方法

1. [OpenAI Platform](https://platform.openai.com/api-keys) にアクセス
2. ログインまたはアカウント作成
3. "Create new secret key" をクリック
4. キーをコピーして `.env` ファイルに貼り付け

## 注意事項

- `.env` ファイルは Git に含まれません（.gitignore に追加済み）
- APIキーは他人と共有しないでください
- 本番環境では環境変数を適切に設定してください

## 開発サーバーの再起動

`.env` ファイルを作成・編集した後は、開発サーバーを再起動してください：

```bash
npm run dev
```