import { useState, useEffect, useCallback } from 'react'
import type { Task, Emperor } from '../types'

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

  // Mock advice data for now (until backend is implemented)
  const mockAdvices = {
    'Marcus Aurelius': [
      '**Memento mori.**\n死を忘れるな。時間は有限だ。今この瞬間に集中せよ。',
      '**Quod tibi fieri non vis, alteri ne feceris.**\n自分がされたくないことを、他人にするな。まず自分のタスクを完成させよ。',
      '**Amor fati.**\n運命を愛せ。困難なタスクも成長の機会と捉えよ。'
    ],
    'Augustus': [
      '**Festina lente.**\nゆっくり急げ。計画的に進めることが最速の道だ。',
      '**Acta, non verba.**\n言葉ではなく行動を。タスクは実行してこそ価値がある。',
      '**Divide et impera.**\n分割して統治せよ。大きなタスクは小さく分けて攻略せよ。'
    ],
    'Trajan': [
      '**Optimus princeps.**\n最良の指導者たれ。自らを律することから始めよ。',
      '**Victoria aut mors.**\n勝利か死か。半端な努力は敗北に等しい。',
      '**Imperium sine fine.**\n終わりなき帝国。継続的な努力が偉大さを生む。'
    ]
  }

  const getRandomAdvice = () => {
    const emperorAdvices = mockAdvices[emperor.name as keyof typeof mockAdvices] || [
      `**${emperor.quoteLatin}**\n${emperor.quoteJp}\n\n今日のタスクに全力を尽くせ。`
    ]
    return emperorAdvices[Math.floor(Math.random() * emperorAdvices.length)]
  }

  const updateAdvice = useCallback(() => {
    setLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const newAdvice = getRandomAdvice()
      setAdvice(newAdvice)
      setLastUpdate(new Date())
      setLoading(false)
      setShowAdvice(true)
    }, 500)
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
          <div className="advice-text" dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br>') }} />
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