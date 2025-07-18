import { useState, useEffect, useCallback } from 'react'
import type { Task, Emperor } from '../types'
import { getOpenAIApiKey } from '../utils/openai'

interface EmperorAdviceProps {
  emperor: Emperor
  tasks: Task[]
  autoRefreshInterval?: number // in seconds, default 300 (5 minutes)
}

const EmperorAdvice: React.FC<EmperorAdviceProps> = ({ emperor, tasks, autoRefreshInterval = 300 }) => {
  const [advice, setAdvice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [showAdvice, setShowAdvice] = useState(false)
  const [useOpenAI, setUseOpenAI] = useState(false)

  // Mock advice data for now (until backend is implemented)
  const mockAdvices = {
    'Julius Caesar': [
      '**Ave, imperator futuris rebus!**\n**Vides tria munera: mathematica dormit, verba Anglica militant, ludus cras paratur. Divide: XL minuta mathematicae, XXV verbis, XV ludo.**\n**Alea iacta est!**\n未来の征服者よ！三つの任務が見える：数学は眠り、英単語は戦い、明日の準備が待つ。分割せよ：数学40分、単語25分、準備15分。サイは投げられた！\n\n―ユリウス・カエサル',
      '**Salve, dux studiorum!**\n**Gallia trifaria divisa est—sic et labores tui! Mathematica primum expugna, deinde vocabula, denique ludum para.**\n**Veni, vidi, vici!**\n学問の将よ！ガリアが三分されたように、君の仕事も三分せよ！まず数学を攻略し、次に単語、最後に競技の準備を。来た、見た、勝った！\n\n―ユリウス・カエサル'
    ],
    'Marcus Aurelius': [
      '**Ave, φιλόσοφε.**\n**Tria officia: unum intactum, alterum in cursu, tertium futurum. Ordo est anima rerum. Prior mathematica, media verba, ultima praeparatio.**\n**τὰ εἰς ἑαυτόν.**\n哲学する者よ。三つの務め：一つは手付かず、一つは進行中、一つは将来。秩序は万物の魂。数学を先に、言葉を中に、準備を最後に。自省録より。\n\n―マルクス・アウレリウス',
      '**Salve, civis mundi.**\n**Tempus fluit ut Danuvius. Mathematica XL minuta petit, verba XXV, ludus XV. Memento: impedimentum via est.**\n**Fata volentem ducunt.**\n世界市民よ。時はドナウ川のように流れる。数学は40分を求め、単語は25分、競技は15分。忘るな：障害こそ道。運命は従う者を導く。\n\n―マルクス・アウレリウス'
    ],
    'Seneca the Younger': [
      '**Ave, discipule temporis!**\n**Tria labores, sed unum tempus. Ordo: mathematica (gravis), verba (media), ludus (levis). Noli multum simul—singulatim vince!**\n**Omnia tempus habent.**\n時の弟子よ！三つの労働、されど時は一つ。順序：数学（重）、単語（中）、競技（軽）。同時に多くを望むな—個別に勝て！万物に時あり。\n\n―小セネカ',
      '**Salve, architecte diei!**\n**Hora LXXX tibi datur. Divide sapienter: L% mathematicae, XXX% verbis, XX% ludo. Procrastinatio mors est!**\n**Carpe horam!**\n一日の建築家よ！80分が与えられた。賢く分割せよ：50%を数学に、30%を単語に、20%を競技に。先延ばしは死！時を掴め！\n\n―小セネカ'
    ]
  }

  const getRandomAdvice = () => {
    const emperorAdvices = mockAdvices[emperor.name as keyof typeof mockAdvices] || [
      `**${emperor.name}より：**\n**${emperor.quoteLatin}**\n${emperor.quoteJp}\n今日のタスクに全力を尽くせ。\n\n―${getJapaneseEmperorName(emperor.name)}`
    ]
    return emperorAdvices[Math.floor(Math.random() * emperorAdvices.length)]
  }

  // 皇帝名の日本語変換
  const getJapaneseEmperorName = (name: string): string => {
    const nameMap: Record<string, string> = {
      'Julius Caesar': 'ユリウス・カエサル',
      'Marcus Aurelius': 'マルクス・アウレリウス',
      'Seneca the Younger': '小セネカ',
      'Augustus': 'アウグストゥス',
      'Tiberius': 'ティベリウス',
      'Caligula': 'カリグラ',
      'Claudius': 'クラウディウス',
      'Nero': 'ネロ',
      'Vespasian': 'ウェスパシアヌス',
      'Titus': 'ティトゥス',
      'Domitian': 'ドミティアヌス',
      'Trajan': 'トラヤヌス',
      'Hadrian': 'ハドリアヌス',
      'Antoninus Pius': 'アントニヌス・ピウス',
      'Commodus': 'コンモドゥス',
      'Septimius Severus': 'セプティミウス・セウェルス',
      'Caracalla': 'カラカラ',
      'Alexander Severus': 'アレクサンデル・セウェルス',
      'Aurelian': 'アウレリアヌス',
      'Diocletian': 'ディオクレティアヌス',
      'Constantine': 'コンスタンティヌス',
      'Julian': 'ユリアヌス',
      'Theodosius': 'テオドシウス',
      'Justinian': 'ユスティニアヌス'
    }
    return nameMap[name] || name
  }

  // 皇帝の特徴的な性格を定義
  const getEmperorSignature = (name: string): string => {
    const signatures: Record<string, string> = {
      'Julius Caesar': 'military audacity and political genius',
      'Marcus Aurelius': 'Stoic restraint and philosophical wisdom',
      'Hannibal': 'strategic brilliance and relentless determination',
      'Seneca the Younger': 'paradoxical wit and time consciousness',
      'Cicero': 'rhetorical mastery and republican virtue',
      'Hadrian': 'architectural vision and cultured curiosity',
      'Virgil': 'poetic destiny and epic grandeur',
      'Pliny the Elder': 'encyclopedic curiosity and natural philosophy',
      'Tacitus': 'cynical wisdom and historical acuity',
      'Horace': 'lyrical moderation and epicurean balance'
    }
    return signatures[name] || 'imperial authority and wisdom'
  }

  // タスクをAPI用に整形
  const buildTasksJSON = (tasks: Task[]) => {
    return tasks.map(({ id, label, status, estimate_min }) => ({
      id, label, status, estimate_min
    }))
  }

  // システムプロンプトを構築
  const buildSystemPrompt = (emperor: Emperor): string => {
    const signature = getEmperorSignature(emperor.name)
    
    return `You are ${emperor.name}, deified Roman emperor, famed for ${signature}.
## Writing style
- Employ *tricolon*, *parallelism*, and sharp antithesis.
- Begin with an imperial salutation (e.g. "**Ave, discipule sapientiae!**").
- Use at least one metaphor rooted in Roman life (legions, Senate, triumph, gladiators, aqueducts, Forum, etc.).
- Finish with a concise maxim or sign-off (≤10 Latin words).

## Bilingual output
1. Bold Latin line(s) (max 2 sentences, ≤ 40 Latin words).
2. Normal-weight Japanese line(s) (max 2 sentences, ≤ 140 文字).

## Advisory angles (must mention all)
- 未着手(todo) と 進行中(in_progress) のタスクを具体的に指摘。
- 相互作用：どの順序で取り組むか、時間配分のヒント。
- 哲学・逸話：${emperor.name}らしい歴史的文脈や格言。特に「${emperor.quoteLatin}」の精神を活かす。
- 勇気づけ：読後に行動を起こさせる一句。

## Format exactly as:
**<Latin salutation>**
**<Latin body with specific task mentions>**
**<Latin sign-off>**
<Japanese translation>

―${getJapaneseEmperorName(emperor.name)}`
  }

  const updateAdvice = useCallback(async () => {
    setLoading(true)
    
    const apiKey = getOpenAIApiKey()
    // todoとin_progressのタスクを送信（doneは除外）
    const apiTasks = tasks.filter(t => t.status !== 'done')
    
    if (apiKey && tasks.length > 0) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: buildSystemPrompt(emperor)
              },
              {
                role: 'user',
                content: `Here are today's tasks:\n${JSON.stringify(buildTasksJSON(apiTasks), null, 2)}`
              }
            ],
            max_tokens: 256,
            temperature: 0.85,
            top_p: 0.95,
            frequency_penalty: 0.2
          })
        })

        if (response.ok) {
          const data = await response.json()
          setAdvice(data.choices[0].message.content)
          setUseOpenAI(true)
        } else {
          setAdvice(getRandomAdvice())
          setUseOpenAI(false)
        }
      } catch (error) {
        console.error('OpenAI API error:', error)
        setAdvice(getRandomAdvice())
        setUseOpenAI(false)
      }
    } else {
      // Use mock advice if no API key or no tasks
      setTimeout(() => {
        const newAdvice = tasks.length === 0 
          ? 'タスクを追加すると、皇帝からの助言が表示されます。' 
          : getRandomAdvice()
        setAdvice(newAdvice)
        setUseOpenAI(false)
      }, 500)
    }
    
    setLastUpdate(new Date())
    setLoading(false)
    setShowAdvice(true)
  }, [emperor, tasks])

  // Initial load
  useEffect(() => {
    updateAdvice()
  }, [])

  // Auto refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateAdvice()
    }, autoRefreshInterval * 1000)

    return () => clearInterval(intervalId)
  }, [autoRefreshInterval, updateAdvice])

  // Update when emperor changes
  useEffect(() => {
    updateAdvice()
  }, [emperor.name])

  return (
    <div className="emperor-advice-section">
      <div className="advice-header">
        <h4>皇帝の助言</h4>
        {lastUpdate && (
          <span className="advice-timestamp">
            {lastUpdate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      
      <div className={`emperor-advice-content ${loading ? 'loading' : ''}`}>
        {loading ? (
          <div className="advice-loading">
            <div className="loading-spinner"></div>
            <p>皇帝が思案中...</p>
          </div>
        ) : showAdvice ? (
          <div className="advice-text" dangerouslySetInnerHTML={{ 
            __html: advice
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br>')
              .replace(/• /g, '• ')
          }} />
        ) : null}
      </div>
      
      <button 
        className="btn btn-secondary advice-refresh-btn" 
        onClick={updateAdvice}
        disabled={loading}
      >
        新たな助言を求める
      </button>
    </div>
  )
}

export default EmperorAdvice