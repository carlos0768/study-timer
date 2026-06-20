import { useState, useEffect, useCallback } from 'react'
import type { TimerSettings } from '../types'

interface TimerProps {
  hasActiveTasks: boolean
  currentTask?: { label: string; estimate_min: number }
  autoStart?: boolean
  onAutoStartConsumed?: () => void
}

const Timer: React.FC<TimerProps> = ({ hasActiveTasks, currentTask, autoStart = false, onAutoStartConsumed }) => {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('timer-settings')
    if (saved) {
      try { return JSON.parse(saved) } catch { /* fall through */ }
    }
    return { countdownMinutes: 25 }
  })

  const [timeLeft, setTimeLeft] = useState(() => settings.countdownMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      oscillator.connect(audioContext.destination)
      oscillator.frequency.value = 800
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.error('Failed to play beep:', error)
    }
  }

  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: 'Great job! Keep it up!',
        icon: '/favicon.ico'
      })
    }
  }

  const saveStudyLog = (minutes: number) => {
    const today = new Date().toISOString().split('T')[0]
    const logs = JSON.parse(localStorage.getItem('study-logs') || '{}')
    
    if (!logs[today]) {
      logs[today] = { totalMinutes: 0, completedTasks: [] }
    }
    
    logs[today].totalMinutes += minutes
    localStorage.setItem('study-logs', JSON.stringify(logs))
  }

  const handleTimerComplete = useCallback(() => {
    playBeep()
    showNotification()
    setIsRunning(false)
    setHasStarted(false)
    saveStudyLog(settings.countdownMinutes)
  }, [settings])

  useEffect(() => {
    if (!hasStarted) {
      setTimeLeft(settings.countdownMinutes * 60)
    }
  }, [settings.countdownMinutes, hasStarted])

  // Auto-start effect: use task's estimate_min when available
  useEffect(() => {
    if (autoStart && hasActiveTasks && !isRunning) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
      const minutes = currentTask?.estimate_min || settings.countdownMinutes
      setTimeLeft(minutes * 60)
      setSettings(prev => {
        const updated = { ...prev, countdownMinutes: minutes }
        localStorage.setItem('timer-settings', JSON.stringify(updated))
        return updated
      })
      setIsRunning(true)
      setHasStarted(true)
      onAutoStartConsumed?.()
    }
  }, [autoStart, hasActiveTasks, isRunning, onAutoStartConsumed, currentTask?.estimate_min, settings.countdownMinutes, hasStarted])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete()
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isRunning, timeLeft, handleTimerComplete])


  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    if (!hasStarted) {
      const minutes = currentTask?.estimate_min || settings.countdownMinutes
      setTimeLeft(minutes * 60)
    }
    setIsRunning(true)
    setHasStarted(true)
  }

  const handleStop = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setHasStarted(false)
    setTimeLeft(settings.countdownMinutes * 60)
  }

  const updateSettings = (key: keyof TimerSettings, value: number) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('timer-settings', JSON.stringify(newSettings))
    if (!hasStarted) {
      setTimeLeft(value * 60)
    }
  }

  return (
    <div className="timer">

      <div className="timer-display">
        <h2>{formatTime(timeLeft)}</h2>
        {currentTask && (
          <div className="current-task-info">
            <p>現在のタスク: {currentTask.label}</p>
            <p>予定時間: {currentTask.estimate_min}分</p>
          </div>
        )}
      </div>

      <div className="timer-controls">
        {!isRunning ? (
          <button 
            className={`btn btn-primary ${!hasActiveTasks ? 'disabled' : ''}`} 
            onClick={handleStart}
            disabled={!hasActiveTasks}
          >
            {hasActiveTasks ? 'Timer Start' : 'タスクを「Start」で開始してください'}
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={handleStop}>Pause</button>
        )}
        <button className="btn btn-tertiary" onClick={handleReset}>Reset</button>
      </div>

      <div className={`timer-settings ${isRunning ? 'collapsed' : ''}`}>
        <div className="setting-group">
          <label>Minutes:</label>
          <input
            type="number"
            min="1"
            max="180"
            value={settings.countdownMinutes}
            onChange={(e) => updateSettings('countdownMinutes', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>
    </div>
  )
}

export default Timer