import { useState, useEffect, useCallback } from 'react'
import type { TimerMode, TimerSettings } from '../types'

interface TimerProps {
  mode: TimerMode
  onModeChange: (mode: TimerMode) => void
  hasActiveTasks: boolean
  currentTask?: { label: string; estimate_min: number }
}

const Timer: React.FC<TimerProps> = ({ mode, onModeChange, hasActiveTasks, currentTask }) => {
  const [settings, setSettings] = useState<TimerSettings>({
    countdownMinutes: 25,
    pomodoroWorkMinutes: 25,
    pomodoroBreakMinutes: 5
  })
  
  const [timeLeft, setTimeLeft] = useState(settings.countdownMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)

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
        body: mode === 'pomodoro' && isBreak ? 'Time for a break!' : 'Great job! Keep it up!',
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
    
    if (mode === 'pomodoro') {
      if (isBreak) {
        setTimeLeft(settings.pomodoroWorkMinutes * 60)
        setIsBreak(false)
      } else {
        setPomodoroCount(prev => prev + 1)
        setTimeLeft(settings.pomodoroBreakMinutes * 60)
        setIsBreak(true)
      }
    } else {
      setIsRunning(false)
      saveStudyLog(settings.countdownMinutes)
    }
  }, [mode, isBreak, settings])

  useEffect(() => {
    if (mode === 'countdown') {
      setTimeLeft(settings.countdownMinutes * 60)
      setIsBreak(false)
    } else {
      setTimeLeft(settings.pomodoroWorkMinutes * 60)
      setIsBreak(false)
    }
  }, [mode, settings])

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
    if (!hasActiveTasks) {
      alert('タスクを追加して「Start」をクリックしてください')
      return
    }
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setIsRunning(true)
  }

  const handleStop = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    if (mode === 'countdown') {
      setTimeLeft(settings.countdownMinutes * 60)
    } else {
      setTimeLeft(settings.pomodoroWorkMinutes * 60)
      setIsBreak(false)
      setPomodoroCount(0)
    }
  }

  const updateSettings = (key: keyof TimerSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="timer">
      <div className="timer-mode-selector">
        <button 
          className={`mode-btn ${mode === 'countdown' ? 'active' : ''}`}
          onClick={() => onModeChange('countdown')}
        >
          Countdown
        </button>
        <button 
          className={`mode-btn ${mode === 'pomodoro' ? 'active' : ''}`}
          onClick={() => onModeChange('pomodoro')}
        >
          Pomodoro
        </button>
      </div>

      <div className="timer-display">
        <h2>{formatTime(timeLeft)}</h2>
        {currentTask && (
          <div className="current-task-info">
            <p>現在のタスク: {currentTask.label}</p>
            <p>予定時間: {currentTask.estimate_min}分</p>
          </div>
        )}
        {mode === 'pomodoro' && (
          <div className="pomodoro-info">
            <span>{isBreak ? 'Break Time' : 'Work Time'}</span>
            <span>Session: {pomodoroCount}</span>
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
            {hasActiveTasks ? 'Start' : 'タスクを選択してください'}
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={handleStop}>Pause</button>
        )}
        <button className="btn btn-tertiary" onClick={handleReset}>Reset</button>
      </div>

      {!isRunning && (
        <div className="timer-settings">
          {mode === 'countdown' ? (
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
          ) : (
            <>
              <div className="setting-group">
                <label>Work:</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.pomodoroWorkMinutes}
                  onChange={(e) => updateSettings('pomodoroWorkMinutes', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="setting-group">
                <label>Break:</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.pomodoroBreakMinutes}
                  onChange={(e) => updateSettings('pomodoroBreakMinutes', parseInt(e.target.value) || 1)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Timer