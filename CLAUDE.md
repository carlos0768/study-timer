# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Project Status

This is currently an empty project directory for a "study-timer" application. The only existing content is:
- `emperors.csv`: Contains data about 12 Roman emperors with English quotes and local image references
- `emperors_lat_jp.csv`: Contains data about 16 Roman emperors with Latin quotes, Japanese translations, and Wikipedia image URLs
- `.claude/settings.local.json`: Claude CLI configuration

## Project Initialization Required

This project needs to be initialized before development can begin. No framework, package.json, or source code currently exists.

## Available Data

### emperors.csv
Contains English quotes with local image files:
```csv
id,name,quote,img
1,Augustus,"Have I played the part well? Then applaud as I exit.",augustus.webp
2,Tiberius,"In a free state there should be freedom of speech and thought.",tiberius.webp
[... 12 emperors total ...]
```

### emperors_lat_jp.csv
Contains Latin quotes with Japanese translations and Wikipedia image URLs:
```csv
id,name,quoteLatin,quoteJp,img
1,Augustus,Festina lente.,ゆっくり急げ（急がば回れ）,https://upload.wikimedia.org/...
10,Marcus Aurelius,"Habes potestatem in animo tuo, non in rebus externis.",支配できるのは自分の心であって、外の出来事ではない,https://upload.wikimedia.org/...
[... 16 emperors total ...]
```

This data could potentially be used for:
- Motivational quotes during study sessions (Latin/Japanese)
- Theme/aesthetic elements with Roman emperor imagery
- Achievement system based on Roman emperors
- Multi-language support (Latin/Japanese)

## Next Steps for Development

When initializing this project, consider:
1. Choose a framework (React, Vue, vanilla JS, etc.)
2. Set up a build system
3. Implement core study timer functionality
4. Consider using the emperors data for enhanced features

##要件定義
以下の要件定義所に則って開発を行なってください。しかし、この要件定義から逸れるようなことはないようにお願いします。

# 📄 要件定義書（更新版）

| 項目   | 内容                                                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 目的   | **集中維持** が苦手な 16 歳ローマオタク向けに、勉強時間を可視化し "推し皇帝" でモチベーションを刺激する。                                                                              |
| 対象端末 | **PWA**（ブラウザ）<br>MacBook・iPad 両方対応                                                                                                       |
| 主要機能 | 1. **カウントダウン** タイマー（任意分数）<br>2. **ポモドーロ** 手動設定（25-5 推奨）<br>3. **皇帝画像＋名言** を毎正時に自動切替<br>4. **勉強ログ保存**（LocalStorage）<br>5. **ブラウザ通知＋ビープ音** |
| 非機能  | - **オフライン動作**（Service Worker キャッシュ）<br>- デザイン：2019 年頃の **フラット UI**<br>- 無料・広告なし                                                          |
| 成功指標 | ユーザーが **1 日あたり合計 60 分以上** タイマーを起動する日数が 30 日中 20 日以上                                                                                      |

---

## 1. 背景・目的

（変更なし）

## 2. 参照資料  ✨更新

* Notion 公式 API Reference
* Service Worker Cookbook
* **emperors\_lat\_jp.csv — 本要件定義書と同一ディレクトリに配置** ←★NEW

## 3. 用語・略語

（変更なし）

## 4. システム概要

（変更なし）

## 5. データ構造

```jsonc
// emperors_lat_jp.csv（UTF-8, 同ディレクトリ）
// id,name,quoteLatin,quoteJp,img
[
  { "id": 1, "name": "Augustus", "quoteLatin": "Festina lente.", "quoteJp": "ゆっくり急げ", "img": "augustus.webp" },
  ...
]
```

※ アプリはランタイムで同一ディレクトリ内の `emperors_lat_jp.csv` を fetch → JSON へ変換して使用。

## 6. 画面構成

（変更なし）

## 7. 主要コンポーネント

（変更なし）

## 8. ファイル配置  ✨新設

| パス                         | 説明                       |
| -------------------------- | ------------------------ |
| `/index.html`              | メイン HTML                 |
| `/app.js`                  | 主要ロジック                   |
| `/style.css`               | フラット UI スタイル             |
| `/service-worker.js`       | キャッシュ & オフライン            |
| `/assets/emperors/*.webp`  | 皇帝画像（全16枚）               |
| **`/emperors_lat_jp.csv`** | 皇帝データ（ラテン語 + 日本語訳） ←★NEW |
| `/README.md`               | セットアップ手順                 |

## 9. 基本設計書 / 技術要件

（変更なし）

## 10. テスト指示書

T-06 追加：`emperors_lat_jp.csv` を削除した状態で起動 → CSV ロード失敗アラートが表示されること

---

これで **CSV と要件定義書が同一ディレクトリに置かれる** 前提が反映されています。
