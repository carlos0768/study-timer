// ローマ皇帝AI助言システム
class EmperorAI {
    constructor() {
        this.rateLimiter = new RateLimiter();
        this.emperors = [
            { id: 1, name: 'アウグストゥス', personality: '戦略的で慎重、「ゆっくり急げ」の精神' },
            { id: 2, name: 'マルクス・アウレリウス', personality: 'ストイックで哲学的、内省的' },
            { id: 3, name: 'トラヤヌス', personality: '行動的で励ましに満ち、実践的' },
            { id: 4, name: 'ハドリアヌス', personality: '知的で文化的、完璧主義' },
            { id: 5, name: 'アントニヌス・ピウス', personality: '穏やかで思慮深い、調和を重視' },
            { id: 6, name: 'ユリウス・カエサル', personality: '野心的で大胆、リスクを恐れない' },
            { id: 7, name: 'ウェスパシアヌス', personality: '実務的でユーモアがある、現実主義' },
            { id: 8, name: 'ネルウァ', personality: '知恵と経験に富む、バランス感覚' },
            { id: 9, name: 'ティトゥス', personality: '寛大で人望が厚い、楽観的' },
            { id: 10, name: 'クラウディウス', personality: '学者肌で慎重、細部にこだわる' }
        ];
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
            const response = await this.callVercelAPI(prompt);
            
            // レート制限を記録
            this.rateLimiter.recordRequest();
            
            return {
                emperor: emperor.name,
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

        return `あなたは古代ローマ皇帝の${emperor.name}です。
性格: ${emperor.personality}

以下の状況で、16歳の学生に向けて助言をしてください：
${taskContext}

以下の点に注意してアドバイスしてください：
1. ${emperor.name}の性格や歴史的な名言を反映した口調で
2. 現在のタスクへの具体的な励ましやアドバイス
3. 残りタスクがある場合は、それについても言及（「まだ〜が残っているぞ」以外の多様な表現で）
4. 日本語で100文字以内
5. 説教臭くならないよう、親しみやすく

回答は助言の内容のみを返してください。`;
    }

    async callVercelAPI(prompt) {
        const response = await fetch('/api/emperor-advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API呼び出しエラー');
        }

        const data = await response.json();
        return data.advice;
    }

    getFallbackAdvice(tasksInfo) {
        const adviceTemplates = [
            {
                emperor: 'マルクス・アウレリウス',
                templates: [
                    '今この瞬間に集中することが、すべての始まりだ。{current}という目の前の課題に全力を注げ。',
                    '困難は成長の機会。{current}を通じて、君はより強くなる。{remaining_note}',
                    '自分にできることに集中せよ。{current}は君の支配下にある。一歩ずつ進めばよい。'
                ]
            },
            {
                emperor: 'アウグストゥス',
                templates: [
                    'ゆっくり急げ。{current}を着実に進めることが、最も速い道だ。{remaining_note}',
                    '大きな成果も小さな一歩から。{current}という基礎をしっかり固めよ。',
                    '計画的に進めよ。{current}を終えれば、次への道が開ける。{remaining_note}'
                ]
            },
            {
                emperor: 'トラヤヌス',
                templates: [
                    '素晴らしい！{current}に取り組む君の姿勢を讃える。この調子で進めよ！{remaining_note}',
                    '行動こそが全て。{current}を始めた君は、すでに勝利への道を歩んでいる。',
                    '勇気を持て！{current}は君の力を試す良い機会だ。必ず乗り越えられる！'
                ]
            }
        ];

        const emperorAdvice = adviceTemplates[Math.floor(Math.random() * adviceTemplates.length)];
        const template = emperorAdvice.templates[Math.floor(Math.random() * emperorAdvice.templates.length)];
        
        const current = tasksInfo.current ? tasksInfo.current.text : '勉強';
        const remaining = tasksInfo.remainingCount;
        
        let remainingNote = '';
        if (remaining > 1) {
            const remainingPhrases = [
                `残り${remaining}つの課題も、この調子で制覇しよう。`,
                `あと${remaining}つの挑戦が待っているが、恐れることはない。`,
                `他にも${remaining}つのタスクがあるが、一つずつ確実に。`,
                `まだ道のりは続くが、着実に前進している。`
            ];
            remainingNote = remainingPhrases[Math.floor(Math.random() * remainingPhrases.length)];
        }
        
        const advice = template
            .replace('{current}', current)
            .replace('{remaining_note}', remainingNote);
        
        return {
            emperor: emperorAdvice.emperor,
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
            emperor: emperor.name,
            advice: advice,
            timestamp: new Date().toISOString()
        };
    }
}

// グローバルに公開
window.EmperorAI = EmperorAI;