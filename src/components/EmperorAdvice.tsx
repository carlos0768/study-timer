import { useState, useEffect, useCallback, useRef } from 'react'
import type { Task, Emperor } from '../types'
import { getClaudeApiKey } from '../utils/claude'

interface EmperorAdviceProps {
  emperor: Emperor
  tasks: Task[]
  autoRefreshInterval?: number
}

const EmperorAdvice: React.FC<EmperorAdviceProps> = ({ emperor, tasks, autoRefreshInterval = 300 }) => {
  const [advice, setAdvice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showAdvice, setShowAdvice] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasShownInitialAdvice = useRef(false)

  const buildSystemPrompt = (emp: Emperor): string => {
    return `You are ${emp.name}, a historical Roman figure. Speak in character.
Output bilingual advice: bold Latin lines then plain Japanese lines.
Format:
**<Latin salutation>**
**<Latin advice referencing tasks by name> — <your Latin name>**
<Japanese translation> — <your Japanese name>
Rules: mention incomplete tasks, suggest priority/time allocation, weave in your known philosophy or historical deeds. Max 3 paragraphs. Keep Japanese under 140 chars per paragraph.`
  }

  const showAdviceTemporarily = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    setIsVisible(true)
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 180000)
  }

  const updateAdvice = useCallback(async () => {
    setLoading(true)

    const apiKey = getClaudeApiKey()
    const activeTasks = tasks.filter(t => t.status !== 'done')

    if (apiKey && activeTasks.length > 0) {
      try {
        const tasksJson = JSON.stringify(activeTasks.map(({ label, status, estimate_min }) => ({
          label, status, estimate_min
        })))

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            system: buildSystemPrompt(emperor),
            messages: [{
              role: 'user',
              content: `Today's tasks:\n${tasksJson}\nCurrent time: ${new Date().toLocaleTimeString('ja-JP')}`
            }]
          })
        })

        if (response.ok) {
          const data = await response.json()
          const text = data.content?.[0]?.text
          if (text) {
            setAdvice(text)
          } else {
            setAdvice(getFallbackAdvice())
          }
        } else {
          setAdvice(getFallbackAdvice())
        }
      } catch (error) {
        console.error('Claude API error:', error)
        setAdvice(getFallbackAdvice())
      }
    } else {
      setTimeout(() => {
        setAdvice(tasks.length === 0
          ? 'タスクを追加すると、皇帝からの助言が表示されます。'
          : getFallbackAdvice())
      }, 500)
    }

    setLoading(false)
    setShowAdvice(true)
    showAdviceTemporarily()
  }, [emperor, tasks])

  const getFallbackAdvice = (): string => {
    return `**${emperor.quoteLatin} — ${emperor.name}**\n${emperor.quoteJp}\n今日のタスクに全力を尽くせ。`
  }

  useEffect(() => {
    if (tasks.length > 0 && !hasShownInitialAdvice.current) {
      const today = new Date().toDateString()
      const lastShownDate = localStorage.getItem('emperor-advice-last-shown')

      if (lastShownDate !== today) {
        const initialDelay = setTimeout(() => {
          updateAdvice()
          localStorage.setItem('emperor-advice-last-shown', today)
          hasShownInitialAdvice.current = true
        }, 3000)
        return () => clearTimeout(initialDelay)
      } else {
        hasShownInitialAdvice.current = true
      }
    }
  }, [tasks.length, updateAdvice])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isVisible) {
        updateAdvice()
      }
    }, autoRefreshInterval * 1000)
    return () => clearInterval(intervalId)
  }, [autoRefreshInterval, updateAdvice, isVisible])

  useEffect(() => {
    const changeDelay = setTimeout(() => {
      if (!isVisible) {
        updateAdvice()
      }
    }, 2000)
    return () => clearTimeout(changeDelay)
  }, [emperor.name, isVisible])

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

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  if (!isVisible || !showAdvice) {
    return null
  }

  return (
    <div
      ref={dragRef}
      className={`emperor-advice-compact ${isDragging ? 'dragging' : ''} ${isVisible ? 'fade-in' : 'fade-out'}`}
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
        ) : (
          <div className="advice-text" dangerouslySetInnerHTML={{
            __html: advice
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br>')
          }} />
        )}
      </div>
    </div>
  )
}

export default EmperorAdvice
