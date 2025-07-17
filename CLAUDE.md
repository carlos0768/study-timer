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

以下は **ローマ皇帝 AI 助言機能** 向け **Chat Completion API 要件定義書** のドラフトです。バックエンドから OpenAI に送るペイロード構造、システム／ユーザープロンプトのテンプレート、出力仕様、エラー設計までを網羅し、追加要望（多面的助言・ラテン語＋日本語併記・ラテン語行を太字）を反映しています。

---

## 概要

本 API は「今日のタスク」情報と希望する皇帝名を受け取り、その皇帝の歴史的功績・思想・口調を忠実に再現した二言語（ラテン語＋日本語）の助言を返します。ラテン語部分は Markdown で **太字**、日本語部分は通常テキストで返すことを必須とします。タスクの未完了指摘だけでなく、優先順位、相互関係、時間配分、精神的・戦略的洞察など複合的な示唆を与えるようモデルに明示します。ローマ皇帝の史実・思想は十分に公開済み資料があるため、まずはプロンプトエンジニアリングのみで MVP を実装し、語調の均一化が懸念された場合に限り few‑shot ファインチューニングを検討する方針です。([Daily Stoic][1], [HISTORY][2], [ウィキペディア][3], [ウィキペディア][4], [ウィキペディア][5], [Latin D][6], [OpenAI Platform][7], [OpenAI Platform][8], [TIME][9], [WIRED][10])

---

## 1. 背景・目的

### 1.1 背景

* マルクス・アウレリウスの『自省録』が今なお自己啓発書として読まれるほど、皇帝たちは行動指針の宝庫である。([Daily Stoic][1])
* アウグストゥスは行政改革と秩序構築に長け、タスク管理との相性が高い。([HISTORY][2])
* トラヤヌスは帝国最大版図を達成し、拡張戦略のメタファーが豊富。([ウィキペディア][3])

### 1.2 目的

* ユーザーのタスク遂行に歴史的・哲学的視点とユーモアを与え、モチベーションを向上。
* 出力を Markdown だけでリッチ表現可能にし、クライアント側レンダリングを簡素化。

---

## 2. API エンドポイント仕様

| 項目                | 内容                                       |
| ----------------- | ---------------------------------------- |
| **Method / Path** | `POST /v1/roman-emperor/advice`          |
| **Auth**          | Bearer Token （OpenAI API key をバックエンドで保持） |
| **Timeout**       | 15 s                                     |
| **Rate Limit**    | 同時呼び出し 3 req/sec まで                      |

---

## 3. リクエスト Payload

```jsonc
{
  "emperor_name": "Marcus Aurelius",         // 必須: Roman emperor canonical name
  "today_tasks": [                           // 必須: タスク配列
    { "id": "math",        "label": "数学問題集 P.32‑40", "status": "todo", "estimate_min": 40 },
    { "id": "english",     "label": "英単語 50 語暗記",      "status": "in_progress", "estimate_min": 25 },
    { "id": "club_prep",   "label": "明日のバスケ部準備",     "status": "todo", "estimate_min": 15 }
  ],
  "tone_adjustment": "厳格",                 // 任意: "厳格" | "親しみ" | "皮肉"
  "language": "ja-lat",                      // 固定値: ラテン語＋日本語出力を要求
  "client_meta": {                           // 任意: クライアント情報
    "tz": "Asia/Tokyo",
    "platform": "iOS"
  }
}
```

### 3.1 JSON Schema (抜粋)

* `status` ∈ {"todo","in\_progress","done"}
* `estimate_min` ≥ 0 (integer)
* `today_tasks` length ≤ 12

---

## 4. プロンプトテンプレート

### 4.1 System Prompt

```text
You are {emperor_name}, a deified Roman emperor.
Speak in the emperor's authentic voice, based on historical achievements and philosophy.
Output MUST be bilingual: first the Latin sentence(s) in bold Markdown, then the equivalent Japanese sentence(s) in lower case.
Rules:
1. Begin with an emphatic imperial salutation.
2. Mention at least three distinct advisory angles:
   • 未着手または遅延タスクの指摘  
   • タスク間の優先順位と相互作用の洞察  
   • 皇帝独自の哲学・歴史的逸話を絡めた戦略的助言  
3. Avoid anachronism and stay faithful to the emperor's mindset (e.g. Stoic restraint for Marcus Aurelius, dramatic flair for Nero).
4. Limit total output to ≤ 140 Japanese characters per paragraph pair.
Format:
**<Latin Salutation>**  
latin body …  
<latin line breaks if needed>  
latin sign-off  
non-bold japanese salutation  
japanese body …  
japanese sign-off
```

### 4.2 User Prompt (動的挿入)

```text
Here are today's tasks in JSON. Analyze them fully and respond per the rules.
{today_tasks in JSON}
Tone: {tone_adjustment}
Current time: {ISO8601 in user's TZ}
```

---

## 5. モデル呼び出しパラメータ

| パラメータ              | 値             | 参考                                                                           |
| ------------------ | ------------- | ---------------------------------------------------------------------------- |
| `model`            | `gpt-4o-mini` | 軽量・低レイテンシ                                                                    |
| `temperature`      | 0.9           | 独創性確保。温度は出力多様性と創造性に関連するとされるが、過度は一貫性低下を招く。([OpenAI Platform][8], [arXiv][11]) |
| `top_p`            | 0.9           | 高確率語彙偏重の回避                                                                   |
| `presence_penalty` | 0.5           | 同語反復抑制                                                                       |
| `max_tokens`       | 256           | 日ラ二言語で十分な長さ                                                                  |

---

## 6. レスポンス仕様

```jsonc
{
  "id": "chatcmpl-abc123",
  "created": 1752750000,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "**Salve, iuvenis diligentissime!**\n**Nondum aggressus es quaestiones mathematicae; prius eas expugna ut mentem acuere possis.**\n**Verbis Anglois memoria tibi parabit arma sapientiae; sed cave ne tempus effluat!**\n**Denique, antequam sol occidat, paratus esto pro certamine corporum in palaestra. Vale.**\nさあ若者よ、数学の城を落として心を研ぎ澄ませ。\n英単語は知の武器となるが、時間の逸失に注意せよ。\nそして日暮れ前にはバスケの備えを整え、勝利を掴め。— マルクス・アウレリウス"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 540, "completion_tokens": 102, "total_tokens": 642 }
}
```

* **Markdown 太字**はラテン語行すべてに適用する。日本語行は太字不可。
* 各助言ブロックは「ラテン語 → 改行 → 日本語」の順を 1 セットとして最大 3 セットまで。

---

## 7. エラーハンドリング

| HTTP | code                    | 説明                           |
| ---- | ----------------------- | ---------------------------- |
| 400  | `invalid_request_error` | emperor\_name 不正、tasks 配列空など |
| 401  | `authentication_error`  | API key 無効                   |
| 429  | `rate_limit_error`      | 秒間上限超過                       |
| 500  | `internal_error`        | OpenAI 側障害／タイムアウト            |

---

## 8. セキュリティ & 運用

1. OpenAI API Key はサーバー環境変数で暗号化管理。
2. リクエストログからタスク詳細をハッシュ化し、個人情報を保持しない。
3. 出力は Markdown のみ許可し、HTML タグ挿入を防止。

---

## 9. 拡張・チューニング方針

| シナリオ   | 判定    | 対応                               |
| ------ | ----- | -------------------------------- |
| 語調が均質化 | 可能性あり | 皇帝ごと 20‑50 件の Q‑A を few‑shot 微調整 |
| 新皇帝追加  | 高頻度   | システムプロンプトに定義追記                   |
| 史実誤謬   | 低頻度   | 外部 RAG で一次史料を渡す                  |

---

## 10. 参考文献・出典

* Marcus Aurelius のストア派思想と『自省録』概要 ([Daily Stoic][1])
* Pax Romana 期のアウグストゥス行政改革 ([HISTORY][2])
* トラヤヌス時代の領土最大化 ([ウィキペディア][3])
* ハドリアヌスの防壁建設 ([ウィキペディア][4])
* ネロの芸術奨励と文化政策 ([ウィキペディア][5])
* 「Oderint dum metuant」ラテン語引用 ([Latin D][6])
* OpenAI Chat Completion API 基本ドキュメント ([OpenAI Platform][7])
* Advanced usage: temperature パラメータ説明 ([OpenAI Platform][8])
* 温度と創造性に関する研究 ([arXiv][11])
* ‘Meditations’ が現代に与える影響 (TIME) ([TIME][9])
* ストア派思想と現代テックカルチャー (WIRED) ([WIRED][10])

---

この要件定義書をベースに、バックエンドのリクエスト生成部分で System / User メッセージを組み立て、OpenAI Chat Completion API へ送信すれば、皇帝らしい多面的・二言語アドバイスを即利用できます。

[1]: https://dailystoic.com/meditations-marcus-aurelius/?utm_source=chatgpt.com "Meditations by Marcus Aurelius: Book Summary, Key Lessons and ..."
[2]: https://www.history.com/articles/pax-romana-roman-empire-peace-augustus?utm_source=chatgpt.com "How Ancient Rome Thrived During Pax Romana - History.com"
[3]: https://en.wikipedia.org/wiki/Trajan?utm_source=chatgpt.com "Trajan - Wikipedia"
[4]: https://en.wikipedia.org/wiki/Hadrian%27s_Wall?utm_source=chatgpt.com "Hadrian's Wall - Wikipedia"
[5]: https://en.wikipedia.org/wiki/Nero?utm_source=chatgpt.com "Nero - Wikipedia"
[6]: https://latindiscussion.org/threads/let-them-hate-me-as-long-as-they-fear-me.2398/?utm_source=chatgpt.com "let them hate me as long as they fear me - Latin D"
[7]: https://platform.openai.com/docs/api-reference/introduction?utm_source=chatgpt.com "API Reference - OpenAI Platform"
[8]: https://platform.openai.com/docs/advanced-usage?utm_source=chatgpt.com "Advanced usage - OpenAI API"
[9]: https://time.com/6852921/marcus-aurelius-imeditations/?utm_source=chatgpt.com "Why We Still Read Marcus Aurelius' <i>Meditations</i>"
[10]: https://www.wired.com/story/susan-fowler-uber-sexism-stoicism?utm_source=chatgpt.com "All that's good and bad about Silicon Valley's Stoicism fad"
[11]: https://arxiv.org/abs/2405.00492?utm_source=chatgpt.com "Is Temperature the Creativity Parameter of Large Language Models?"
