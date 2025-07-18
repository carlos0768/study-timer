import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })

  // Mock advice data for now (until backend is implemented)
  const mockAdvices = {
    'Julius Caesar': [
      '**Ave, imperator futuris rebus!**\n**Vides tria munera: mathematica dormit, verba Anglica militant, ludus cras paratur. Divide: XL minuta mathematicae, XXV verbis, XV ludo. — Gaius Iulius Caesar**\n未来の征服者よ！三つの任務が見える：数学は眠り、英単語は戦い、明日の準備が待つ。分割せよ：数学40分、単語25分、準備15分。— ユリウス・カエサル',
      '**Salve, dux studiorum!**\n**Gallia trifaria divisa est—sic et labores tui! Mathematica primum expugna, deinde vocabula, denique ludum para. — Gaius Iulius Caesar**\n学問の将よ！ガリアが三分されたように、君の仕事も三分せよ！まず数学を攻略し、次に単語、最後に競技の準備を。— ユリウス・カエサル'
    ],
    'Marcus Aurelius': [
      '**Ave, φιλόσοφε.**\n**Tria officia: unum intactum, alterum in cursu, tertium futurum. Ordo est anima rerum. Prior mathematica, media verba, ultima praeparatio. — Marcus Aurelius Antoninus**\n哲学する者よ。三つの務め：一つは手付かず、一つは進行中、一つは将来。秩序は万物の魂。数学を先に、言葉を中に、準備を最後に。— マルクス・アウレリウス',
      '**Salve, civis mundi.**\n**Tempus fluit ut Danuvius. Mathematica XL minuta petit, verba XXV, ludus XV. Memento: impedimentum via est. — Marcus Aurelius Antoninus**\n世界市民よ。時はドナウ川のように流れる。数学は40分を求め、単語は25分、競技は15分。忘るな：障害こそ道。— マルクス・アウレリウス'
    ],
    'Seneca the Younger': [
      '**Ave, discipule temporis!**\n**Tria labores, sed unum tempus. Ordo: mathematica (gravis), verba (media), ludus (levis). Noli multum simul—singulatim vince! — Lucius Annaeus Seneca**\n時の弟子よ！三つの労働、されど時は一つ。順序：数学（重）、単語（中）、競技（軽）。同時に多くを望むな—個別に勝て！— 小セネカ',
      '**Salve, architecte diei!**\n**Hora LXXX tibi datur. Divide sapienter: L% mathematicae, XXX% verbis, XX% ludo. Procrastinatio mors est! — Lucius Annaeus Seneca**\n一日の建築家よ！80分が与えられた。賢く分割せよ：50%を数学に、30%を単語に、20%を競技に。先延ばしは死！— 小セネカ'
    ]
  }

  const getRandomAdvice = () => {
    const fullLatinName = getFullLatinName(emperor.name)
    const japaneseEmperorName = getJapaneseEmperorName(emperor.name)
    const emperorAdvices = mockAdvices[emperor.name as keyof typeof mockAdvices] || [
      `**${emperor.name}より：**\n**${emperor.quoteLatin} — ${fullLatinName}**\n${emperor.quoteJp}\n今日のタスクに全力を尽くせ。— ${japaneseEmperorName}`
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

  // 皇帝の正式なラテン名
  const getFullLatinName = (name: string): string => {
    const nameMap: Record<string, string> = {
      'Julius Caesar': 'Gaius Iulius Caesar',
      'Marcus Aurelius': 'Marcus Aurelius Antoninus',
      'Seneca the Younger': 'Lucius Annaeus Seneca',
      'Augustus': 'Gaius Iulius Caesar Augustus',
      'Tiberius': 'Tiberius Caesar Augustus',
      'Caligula': 'Gaius Caesar Augustus Germanicus',
      'Claudius': 'Tiberius Claudius Caesar Augustus Germanicus',
      'Nero': 'Nero Claudius Caesar Augustus Germanicus',
      'Vespasian': 'Titus Flavius Vespasianus',
      'Titus': 'Titus Flavius Vespasianus',
      'Domitian': 'Titus Flavius Domitianus',
      'Trajan': 'Marcus Ulpius Traianus',
      'Hadrian': 'Publius Aelius Hadrianus',
      'Antoninus Pius': 'Titus Aurelius Fulvus Boionius Antoninus',
      'Commodus': 'Marcus Aurelius Commodus Antoninus',
      'Septimius Severus': 'Lucius Septimius Severus',
      'Caracalla': 'Marcus Aurelius Severus Antoninus',
      'Alexander Severus': 'Marcus Aurelius Severus Alexander',
      'Aurelian': 'Lucius Domitius Aurelianus',
      'Diocletian': 'Gaius Aurelius Valerius Diocletianus',
      'Constantine': 'Flavius Valerius Constantinus',
      'Julian': 'Flavius Claudius Iulianus',
      'Theodosius': 'Flavius Theodosius',
      'Justinian': 'Flavius Petrus Sabbatius Iustinianus'
    }
    return nameMap[name] || name
  }

  // Few-shot サンプル - 皇帝ごとの具体例（実在引用含む）
  const fewShotSamples: Record<string, string[]> = {
    'Julius Caesar': [
      // 実在引用
      `**"Veni, vidi, vici." — Gaius Iulius Caesar**\n来た、見た、勝った。— ユリウス・カエサル`,
      // タスク用アドバイス
      `**Salve, imperator futuris rebus!**\n**Vides tria munera: Mathematica instar Galliae expugnanda, Anglica Legatio ut senatus persuadenda, Historia Orbis quasi commentarii scribendi. Rubico tuo esto studium! — Gaius Iulius Caesar**\n未来の征服者よ！三つの任務：数学はガリアの如く攻略し、英語は元老院の如く説得し、世界史は記録の如く記せ。学習こそ君のルビコン川！— ユリウス・カエサル`
    ],
    'Marcus Aurelius': [
      // 実在引用
      `**"Quod nocet, saepe docet." — Marcus Aurelius Antoninus**\n害するものが、しばしば教える。— マルクス・アウレリウス`,
      // タスク用アドバイス
      `**Ave, discipule rationis.**\n**Mathematica est τὸ ἡγεμονικόν mentis tuae, Anglica fenestra in κόσμος, Historia speculum τῶν ἀνθρωπίνων. Ordo naturae sequere: primo fortifica, deinde communica, denique contemplare. — Marcus Aurelius Antoninus**\n理性の弟子よ。数学は君の指導理性、英語は世界への窓、歴史は人間性の鏡。自然の秩序に従え：まず強化し、次に伝達し、最後に瞑想せよ。— マルクス・アウレリウス`
    ],
    'Hadrian': [
      // 実在引用
      `**"Animula vagula blandula." — Publius Aelius Hadrianus**\nさまよえる小さき優しき魂よ。— ハドリアヌス`,
      // タスク用アドバイス
      `**Salve, architecte mentis!**\n**Ut Vallum meum fines tutatur, ita Mathematicam primum firma quasi fundamentum; Anglicae Legationi portas aperi ut pontem; Historiam Orbis inspice quasi templum. Tempus est caementum! — Publius Aelius Hadrianus**\n精神の建築家よ！我が長城が境界を守る如く、数学を基礎として固め、英語に橋として門を開き、世界史を神殿として眺めよ。時間はセメントなり！— ハドリアヌス`
    ],
    'Seneca the Younger': [
      // 実在引用
      `**"Docendo discimus." — Lucius Annaeus Seneca, Epistulae Morales**\n教えることで我々は学ぶ。— 小セネカ『道徳書簡集』`,
      // タスク用アドバイス
      `**Ave, discipule temporis!**\n**Quid prodest Mathematica si tempus fugit? Quid Anglica si verba vacant? Quid Historia si praesens negligis? Age: XL minuta primae, XXV secundae, nihil postea—tempus ipsum docet. — Lucius Annaeus Seneca**\n時の弟子よ！時が逃げるなら数学に何の益？言葉が空なら英語に何の益？現在を怠るなら歴史に何の益？行動せよ：最初に40分、次に25分、その後は無し—時自身が教える。— 小セネカ`
    ]
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

  // タスク名をローマ風に変換
  const romanize = (label: string): string => {
    return label
      .replace(/数学/g, 'Mathematica')
      .replace(/英語/g, 'Anglica')
      .replace(/英検/g, 'Anglica Legatio')
      .replace(/世界史/g, 'Historia Orbis')
      .replace(/日本史/g, 'Historia Nipponica')
      .replace(/物理/g, 'Physica')
      .replace(/化学/g, 'Chemia')
      .replace(/生物/g, 'Biologia')
      .replace(/国語/g, 'Lingua Nipponica')
      .replace(/古文/g, 'Classica Nipponica')
      .replace(/漢文/g, 'Sinica Classica')
      .replace(/プログラミング/g, 'Ars Computatoria')
      .replace(/勉強/g, 'Studium')
      .replace(/宿題/g, 'Pensum')
      .replace(/テスト/g, 'Examen')
      .replace(/試験/g, 'Probatio')
  }

  // タスクをAPI用に整形
  const buildTasksJSON = (tasks: Task[]) => {
    return tasks.map(({ id, label, status, estimate_min }) => ({
      id, 
      label, 
      status, 
      estimate_min,
      roman_label: romanize(label)  // ローマ風ラベルを追加
    }))
  }

  // 皇帝ごとの決まり文句
  const getEmperorMaxim = (name: string): string => {
    const maxims: Record<string, string> = {
      'Julius Caesar': 'Alea iacta est!',
      'Marcus Aurelius': 'τὰ εἰς ἑαυτόν.',
      'Hadrian': 'Animus autem sine litteris mors est.',
      'Seneca the Younger': 'Omnia aliena sunt, tempus tantum nostrum est.',
      'Augustus': 'Festina lente.',
      'Nero': 'Qualis artifex pereo!',
      'Trajan': 'Felicior Augusto, melior Traiano.',
      'Constantine': 'In hoc signo vinces.',
      'Cicero': 'Cedant arma togae.',
      'Virgil': 'Forsan et haec olim meminisse iuvabit.'
    }
    return maxims[name] || 'Memento mori.'
  }

  // システムプロンプトを構築
  const buildSystemPrompt = (emperor: Emperor): string => {
    const signature = getEmperorSignature(emperor.name)
    const maxim = getEmperorMaxim(emperor.name)
    const fullLatinName = getFullLatinName(emperor.name)
    const japaneseEmperorName = getJapaneseEmperorName(emperor.name)
    
    return `You are ${fullLatinName}, Roman emperor and patron of the arts, famed for ${signature}.

## Output specification
- FIRST: Bold Latin advice (max 2 sentences, ≤ 40 words) ending with a signature line: — ${fullLatinName}
- SECOND: Japanese translation (≤ 140 文字) ending with: — ${japaneseEmperorName}
- Writing tone: measured, ${emperor.name === 'Hadrian' ? 'architectonic metaphors' : emperor.name === 'Marcus Aurelius' ? 'stoic philosophy' : emperor.name === 'Julius Caesar' ? 'military conquest' : 'rhetorical'} parallelism

## Mandatory content
1. 未着手(todo)・進行中(in_progress) タスクを具体的に指摘（roman_label使用）
2. 時間配分＆順序（例: "XL minuta Mathematicae"）
3. 歴史的逸話または公句を絡める（例: ${emperor.name === 'Hadrian' ? '"Vallum Hadriani"' : emperor.name === 'Julius Caesar' ? '"Rubicon"' : '"exempla historiae"'}）
4. 勇気づけの一句

## Format exactly as:
**<Latin salutation with epithet>**
**<Latin body using roman_labels and specific metaphors> — ${fullLatinName}**
<Japanese translation> — ${japaneseEmperorName}`
  }

  const updateAdvice = useCallback(async () => {
    setLoading(true)
    
    const apiKey = getOpenAIApiKey()
    // todoとin_progressのタスクを送信（doneは除外）
    const apiTasks = tasks.filter(t => t.status !== 'done')
    
    if (apiKey && tasks.length > 0) {
      try {
        // Few-shot examples を追加
        const shots = (fewShotSamples[emperor.name] || []).map(content => ({
          role: 'assistant' as const,
          content
        }))

        const messages = [
          {
            role: 'system' as const,
            content: buildSystemPrompt(emperor)
          },
          ...shots,  // Few-shot サンプルを挿入
          {
            role: 'user' as const,
            content: `Here are today's tasks:\n${JSON.stringify(buildTasksJSON(apiTasks), null, 2)}`
          }
        ]

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            max_tokens: 300,
            temperature: 0.95,
            top_p: 0.95,
            frequency_penalty: 0.2,
            presence_penalty: 0.3
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
  }, [updateAdvice])

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

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      })
    }
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div 
      ref={dragRef}
      className={`emperor-advice-compact ${isDragging ? 'dragging' : ''}`}
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
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
      
    </div>
  )
}

export default EmperorAdvice