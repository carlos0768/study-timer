import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Timer from './components/Timer'
import EmperorDisplay from './components/EmperorDisplay'
import TaskManager from './components/TaskManager'
import EmperorAdvice from './components/EmperorAdvice'
import type { Emperor, Task, TimerMode } from './types'

function App() {
  const [timerMode, setTimerMode] = useState<TimerMode>('countdown')
  const [currentEmperor, setCurrentEmperor] = useState<Emperor | null>(null)
  const [emperors, setEmperors] = useState<Emperor[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [devMode, setDevMode] = useState(false)
  const [selectedEmperorIndex, setSelectedEmperorIndex] = useState(0)

  useEffect(() => {
    loadEmperors()
    loadTasks()
  }, [])

  useEffect(() => {
    if (!devMode) {
      const intervalId = setInterval(() => {
        const currentHour = new Date().getHours()
        if (emperors.length > 0) {
          const emperorIndex = currentHour % emperors.length
          setCurrentEmperor(emperors[emperorIndex])
        }
      }, 1000)

      return () => clearInterval(intervalId)
    }
  }, [emperors, devMode])

  useEffect(() => {
    if (devMode && emperors.length > 0) {
      setCurrentEmperor(emperors[selectedEmperorIndex])
    }
  }, [selectedEmperorIndex, emperors, devMode])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDevMode(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const loadEmperors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/emperors_lat_jp_fixed.csv')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const text = await response.text()
      const lines = text.trim().split('\n').filter(line => line.trim())
      
      const emperorData = lines.slice(1).map(line => {
        // Parse CSV with quotes properly
        const regex = /(?:^|,)("(?:[^"]+|"")*"|[^,]*)/g
        const values: string[] = []
        let match
        
        while ((match = regex.exec(line)) !== null) {
          let value = match[1]
          // Remove surrounding quotes and unescape double quotes
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1).replace(/""/g, '"')
          }
          values.push(value)
        }
        
        return {
          id: parseInt(values[0]),
          name: values[1],
          quoteLatin: values[2],
          quoteJp: values[3],
          img: values[4]
        }
      }).filter(e => e.id && e.name && e.img) // Filter out any invalid entries
      
      console.log('Loaded emperors:', emperorData.length, 'items')
      console.log('First emperor:', emperorData[0])
      if (emperorData.length > 0) {
        console.log('Sample emperor data:', {
          name: emperorData[0].name,
          quoteLatin: emperorData[0].quoteLatin,
          quoteJp: emperorData[0].quoteJp,
          img: emperorData[0].img
        })
      }
      
      setEmperors(emperorData)
      if (emperorData.length > 0) {
        if (!devMode) {
          const currentHour = new Date().getHours()
          setCurrentEmperor(emperorData[currentHour % emperorData.length])
        } else {
          setCurrentEmperor(emperorData[selectedEmperorIndex])
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to load emperors:', error)
      setError(`皇帝データの読み込みに失敗しました: ${error}`)
      setLoading(false)
    }
  }

  const loadTasks = () => {
    try {
      const savedTasks = localStorage.getItem('study-timer-tasks')
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks))
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    }
  }

  const saveTasks = useCallback((newTasks: Task[]) => {
    try {
      setTasks(newTasks)
      localStorage.setItem('study-timer-tasks', JSON.stringify(newTasks))
    } catch (error) {
      console.error('Failed to save tasks:', error)
    }
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  console.log('Current emperor:', currentEmperor)
  console.log('Loading state:', loading)
  console.log('Error state:', error)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Study Timer</h1>
      </header>
      
      <div className="app-container">
        {/* Emperor sidebar - always visible */}
        {currentEmperor && (
          <aside className="emperor-sidebar">
            <EmperorDisplay emperor={currentEmperor} />
            {devMode && (
              <div className="dev-controls">
                <h3>開発者モード</h3>
                <div className="emperor-selector-dev">
                  <button 
                    onClick={() => setSelectedEmperorIndex((prev) => (prev - 1 + emperors.length) % emperors.length)}
                    className="btn btn-secondary"
                  >
                    ← 前の皇帝
                  </button>
                  <span className="emperor-counter">
                    {selectedEmperorIndex + 1} / {emperors.length}
                  </span>
                  <button 
                    onClick={() => setSelectedEmperorIndex((prev) => (prev + 1) % emperors.length)}
                    className="btn btn-secondary"
                  >
                    次の皇帝 →
                  </button>
                </div>
                <select 
                  value={selectedEmperorIndex} 
                  onChange={(e) => setSelectedEmperorIndex(parseInt(e.target.value))}
                  className="emperor-select-dev"
                >
                  {emperors.map((emperor, index) => (
                    <option key={emperor.id} value={index}>
                      {emperor.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </aside>
        )}
        
        {/* Main content area */}
        <main className="app-main">
          {/* Timer and tasks in view */}
          <div className="content-wrapper">
            <div className="timer-section">
              <Timer 
                mode={timerMode} 
                onModeChange={setTimerMode}
                hasActiveTasks={tasks.some(t => t.status === 'in_progress')}
                currentTask={tasks.find(t => t.status === 'in_progress')}
              />
            </div>
            
            {error && (
              <div style={{ color: 'red', padding: '1rem' }}>
                {error}
              </div>
            )}
            
            <div className="tasks-section">
              <TaskManager tasks={tasks} onTasksChange={saveTasks} />
            </div>
          </div>
        </main>
      </div>
      
      {/* Emperor advice floating at app level */}
      {currentEmperor && tasks.length > 0 && (
        <div className="emperor-advice-app-floating">
          <EmperorAdvice emperor={currentEmperor} tasks={tasks} autoRefreshInterval={180} />
        </div>
      )}
    </div>
  )
}

export default App