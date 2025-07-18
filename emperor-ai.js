// ローマ皇帝AI助言システム
class EmperorAI {
    constructor() {
        this.rateLimiter = new RateLimiter();
        this.emperors = [
            { 
                id: 1, 
                shortName: 'アウグストゥス', 
                latinName: 'Imperator Caesar Augustus', 
                jpName: 'アウグストゥス', 
                personality: '戦略的で慎重、「ゆっくり急げ」の精神', 
                background: 'ローマ帝国の基盤を築いた初代皇帝。行政改革と長期計画を重視。', 
                famousQuotes: [
                    { latin: 'Festina lente.', jp: 'ゆっくり急げ。', source: 'Attributed to Augustus' },
                    { latin: 'Acta non verba.', jp: '言葉ではなく行動を。', source: 'Roman proverb, associated with Augustus' }
                ] 
            },
            { 
                id: 2, 
                shortName: 'マルクス・アウレリウス', 
                latinName: 'Marcus Aurelius Antoninus', 
                jpName: 'マルクス・アウレリウス', 
                personality: 'ストイックで哲学的、内省的', 
                background: 'ストア派の哲学者皇帝。自省録を著し、内面的な強さを説く。', 
                famousQuotes: [
                    { latin: 'Quod obstat viae fit via.', jp: '道を阻むものが道となる。', source: 'Meditationes 5.20' },
                    { latin: 'Habes potestatem in animo tuo.', jp: '支配できるのは自分の心だ。', source: 'Meditationes 12.3' }
                ] 
            },
            { 
                id: 3, 
                shortName: 'トラヤヌス', 
                latinName: 'Marcus Ulpius Traianus', 
                jpName: 'トラヤヌス', 
                personality: '行動的で励ましに満ち、実践的', 
                background: '帝国を最大版図に導いた征服者。軍事と福祉を両立。', 
                famousQuotes: [
                    { latin: 'Optimus princeps.', jp: '最良の皇帝。', source: 'Senate title' },
                    { latin: 'Fortes fortuna adiuvat.', jp: '運命は勇者を助ける。', source: 'Roman proverb, associated with Trajan' }
                ] 
            },
            { 
                id: 4, 
                shortName: 'ハドリアヌス', 
                latinName: 'Publius Aelius Hadrianus', 
                jpName: 'ハドリアヌス', 
                personality: '知的で文化的、完璧主義', 
                background: '建築と文化を愛した皇帝。ハドリアヌスの長城を築く。', 
                famousQuotes: [
                    { latin: 'Animula vagula blandula.', jp: '小さな魂よ、さまようものよ。', source: 'Dying poem' },
                    { latin: 'Ordo et methodus.', jp: '秩序と方法。', source: 'Attributed' }
                ] 
            },
            { 
                id: 5, 
                shortName: 'アントニヌス・ピウス', 
                latinName: 'Marcus Aurelius Antoninus', 
                jpName: 'アントニヌス・ピウス', 
                personality: '穏やかで思慮深い、調和を重視', 
                background: '平和な統治で知られる皇帝。安定と公正を重んじる。', 
                famousQuotes: [
                    { latin: 'Aequitas et pax.', jp: '公正と平和。', source: 'Meditationes 12.3' },
                    { latin: 'Prudentia regni.', jp: '王国を統治する賢明さ。', source: 'Meditationes 12.3' }
                ] 
            },
            { 
                id: 6, 
                shortName: 'ユリウス・カエサル', 
                latinName: 'Gaius Julius Caesar', 
                jpName: 'ユリウス・カエサル', 
                personality: '野心的で大胆、リスクを恐れない', 
                background: 'ガリア征服者。ルビコン川を渡り、独裁官に。', 
                famousQuotes: [
                    { latin: 'Veni, vidi, vici.', jp: '来た、見た、勝った。', source: 'Dying poem' },
                    { latin: 'Alea iacta est.', jp: '賽は投げられた。', source: 'Dying poem' }
                ] 
            },
            { 
                id: 7, 
                shortName: 'ウェスパシアヌス', 
                latinName: 'Marcus Ulpius Traianus', 
                jpName: 'ウェスパシアヌス', 
                personality: '実務的でユーモアがある、現実主義', 
                background: '財政改革者。コロッセウム建設を始める。', 
                famousQuotes: [
                    { latin: 'Pecunia non olet.', jp: '金に臭いはない。', source: 'Meditationes 12.3' },
                    { latin: 'Vae, puto deus fio.', jp: 'ああ、神になるのか。', source: 'Meditationes 12.3' }
                ] 
            },
            { 
                id: 8, 
                shortName: 'ネルウァ', 
                latinName: 'Marcus Ulpius Traianus', 
                jpName: 'ネルウァ', 
                personality: '知恵と経験に富む、バランス感覚', 
                background: '短期間の皇帝だが、後継者選びで功績。', 
                famousQuotes: [
                    { latin: 'Sapientia et iustitia.', jp: '知恵と正義。', source: 'Meditationes 12.3' },
                    { latin: 'Moderatio in omnibus.', jp: 'すべてに節制を。', source: 'Meditationes 12.3' }
                ] 
            },
            { 
                id: 9, 
                shortName: 'ティトゥス', 
                latinName: 'Marcus Ulpius Traianus', 
                jpName: 'ティトゥス', 
                personality: '寛大で人望が厚い、楽観的', 
                background: 'ヴェスヴィオ火山噴火時の救済で知られる。', 
                famousQuotes: [
                    { latin: 'Amici, diem perdidi.', jp: '友人よ、私は一日を失った。', source: 'Meditationes 12.3' },
                    { latin: 'Beneficia non obtruduntur.', jp: '恩恵は押し付けない。', source: 'Meditationes 12.3' }
                ] 
            },
            { 
                id: 10, 
                shortName: 'クラウディウス', 
                latinName: 'Marcus Ulpius Traianus', 
                jpName: 'クラウディウス', 
                personality: '学者肌で慎重、細部にこだわる', 
                background: '歴史家皇帝。ブリタニア征服を指揮。', 
                famousQuotes: [
                    { latin: 'Historia magistra vitae.', jp: '歴史は人生の師。', source: 'Meditationes 12.3' },
                    { latin: 'Cautela non nocet.', jp: '注意深さは害にならない。', source: 'Meditationes 12.3' }
                ] 
            }
        ];

        this.fewShotSamples = {
            'アウグストゥス': [
                `**Festina lente.**\nゆっくり急げ。\n— Imperator Caesar Augustus / — アウグストゥス\n焦らず数学で土台を固めよ。残り3件は計画で制す。`
            ],
            'マルクス・アウレリウス': [
                `**Vita brevis est; ars longa.**\n人生は短く、学べることは多い。\n— Marcus Aurelius Antoninus / — マルクス・アウレリウス\n数学を25分やり切り、残りは泰然と受け止めよ。`
            ],
            'トラヤヌス': [
                `**Fortes fortuna adiuvat.**\n運命は勇者を助ける。\n— Marcus Ulpius Traianus / — トラヤヌス\n英語に全力で挑め！残り2件も勝利せよ、勇者よ。`
            ],
            'ハドリアヌス': [
                `**Ordo et methodus.**\n秩序と方法。\n— Publius Aelius Hadrianus / — ハドリアヌス\n{current}を完璧に仕上げ、残りを文化的に繋げよ。`
            ],
            'アントニヌス・ピウス': [
                `**Aequitas et pax.**\n公正と平和。\n— Marcus Aurelius Antoninus / — アントニヌス・ピウス\n{current}を穏やかに進め、残りを調和的に。`
            ],
            'ユリウス・カエサル': [
                `**Veni, vidi, vici.**\n来た、見た、勝った。\n— Gaius Julius Caesar / — ユリウス・カエサル\n{current}を大胆に攻略せよ！残りも一気に！`
            ],
            'ウェスパシアヌス': [
                `**Pecunia non olet.**\n金に臭いはない。\n— Marcus Ulpius Traianus / — ウェスパシアヌス\n{current}を実務的にこなし、残りをユーモアを持って。`
            ],
            'ネルウァ': [
                `**Sapientia et iustitia.**\n知恵と正義。\n— Marcus Ulpius Traianus / — ネルウァ\n{current}をバランスよく、残りを経験で導け。`
            ],
            'ティトゥス': [
                `**Amici, diem perdidi.**\n友人よ、私は一日を失った。\n— Marcus Ulpius Traianus / — ティトゥス\n{current}を寛大に取り組み、残りを楽観的に！`
            ],
            'クラウディウス': [
                `**Historia magistra vitae.**\n歴史は人生の師。\n— Marcus Ulpius Traianus / — クラウディウス\n{current}を慎重に学び、残りを細かく分析せよ。`
            ]
        };
    }

    async getAdvice(tasksInfo) {
        try {
            // レート制限チェック
            const rateCheck = this.rateLimiter.canMakeRequest();
            if (!rateCheck.allowed) {
                throw new Error(rateCheck.reason);
            }

            // ランダムに皇帝を選択
            const emperor = this.emperors[Math.floor(Math.random() * this.emperors.length)];
            
            // プロンプトを生成
            const prompt = this.generatePrompt(emperor, tasksInfo);
            
            // API呼び出し（Vercel関数を使用）
            const response = await this.callVercelAPI(prompt, prompt); // Pass prompt twice for taskContext
            
            // レート制限を記録
            this.rateLimiter.recordRequest();
            
            return {
                emperor: emperor.shortName,
                advice: response,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('AI助言の取得エラー:', error);
            
            // エラー時はフォールバック
            return this.getFallbackAdvice(tasksInfo);
        }
    }

    generatePrompt(emperor, tasksInfo) {
        const current = tasksInfo.current ? tasksInfo.current.text : '勉強';
        const completed = tasksInfo.completedCount;
        const remaining = tasksInfo.remainingCount;
        const total = tasksInfo.totalCount;

        let taskContext = `現在のタスク: ${current}\n`;
        taskContext += `進捗: ${completed}/${total} タスク完了\n`;
        if (remaining > 0 && tasksInfo.remaining.length > 0) {
            const remainingTasks = tasksInfo.remaining
                .filter(t => t.id !== tasksInfo.current?.id)
                .slice(0, 3)
                .map(t => t.text)
                .join('、');
            if (remainingTasks) {
                taskContext += `残りのタスク例: ${remainingTasks}\n`;
            }
        }

        // タスク名をローマ風に変換
        const romanize = (label) => {
            const romanMap = {
                '数学': 'Mathematica',
                '英語': 'Lingua Anglica',
                '歴史': 'Historia',
                // 他のタスク名も追加可能
            };
            return romanMap[label] || label;
        };
        const currentRomanLabel = romanize(current);

        const buildSystemPrompt = (emp) => `
You are ${emp.latinName}, known as 「${emp.jpName}」 in Japanese.
Speak in first‑person singular, dignified yet approachable.

### Output format (MANDATORY)
**<Latin quote>**
<Japanese translation>
— ${emp.latinName} / — ${emp.jpName}
<Advice body in Japanese, ≤90文字>

### Content rules
1. Use ONE real or plausible Latin maxim in the quote line.
2. Mention current task 『${currentRomanLabel}』と remaining ${remaining} 件.
3. Include ${emp.shortName}‑like viewpoint (e.g. Stoic self‑command, long‑range plan, etc.).
4. Encourage action, avoid moralizing sermon.

### Few‑shot
` + (this.fewShotSamples[emp.shortName]?.join('\n') || '');

        return buildSystemPrompt(emperor);
    }

    async callVercelAPI(systemPrompt, taskContext) {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...(this.fewShotSamples[emperor.shortName]?.map(c => ({ role: 'assistant', content: c })) || []),
            { role: 'user', content: taskContext }
        ];

        const response = await fetch('/api/emperor-advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages, max_tokens: 220 })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API呼び出しエラー');
        }

        const data = await response.json();
        return data.advice;
    }

    getFallbackAdvice(tasksInfo) {
        const emperor = this.emperors[Math.floor(Math.random() * this.emperors.length)];
        const templates = this.fewShotSamples[emperor.shortName] || [];
        const template = templates[Math.floor(Math.random() * templates.length)] || '**Fallback quote.**\nフォールバック。\n— ' + emperor.latinName + ' / — ' + emperor.jpName + '\nアドバイス本文';
        
        const current = tasksInfo.current ? tasksInfo.current.text : '勉強';
        const remaining = tasksInfo.remainingCount;
        
        let remainingNote = '';
        if (remaining > 1) {
            remainingNote = `残り${remaining}件も、この調子で。`;
        }
        
        const advice = template
            .replace('{current}', current)
            .replace('{remaining}', remaining.toString())
            .replace('{remaining_note}', remainingNote);
        
        return {
            emperor: emperor.shortName,
            advice: advice,
            timestamp: new Date().toISOString()
        };
    }

    // 特定のタイミングでの自動助言
    getTimedAdvice(context) {
        const templates = {
            pomodoroBreak: [
                'よく頑張った！休憩を取って、次のセッションに備えよ。',
                '素晴らしいセッションだった。少し休んで、また新たな気持ちで取り組もう。',
                '集中力を見事に保った。休憩は次への準備だ。'
            ],
            longStudy: [
                '長時間の集中、見事だ！水分補給を忘れずに。',
                'この持続力は称賛に値する。適度な休憩も戦略の一部だ。',
                '素晴らしい忍耐力！体も大切にしながら進めよ。'
            ],
            taskComplete: [
                '見事な完遂！次なる挑戦も、この勢いで制覇せよ。',
                'よくやった！一つの勝利が、次の勝利を呼ぶ。',
                '素晴らしい！着実な前進が、大きな成果を生む。'
            ]
        };

        const emperor = this.emperors[Math.floor(Math.random() * this.emperors.length)];
        const adviceList = templates[context] || templates.pomodoroBreak;
        const advice = adviceList[Math.floor(Math.random() * adviceList.length)];

        return {
            emperor: emperor.shortName,
            advice: advice,
            timestamp: new Date().toISOString()
        };
    }
}

// グローバルに公開
window.EmperorAI = EmperorAI;