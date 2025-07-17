import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Timer from './components/Timer'
import EmperorDisplay from './components/EmperorDisplay'
import TaskManager from './components/TaskManager'
import type { Emperor, Task, TimerMode } from './types'

function App() {
  const [timerMode, setTimerMode] = useState<TimerMode>('countdown')
  const [currentEmperor, setCurrentEmperor] = useState<Emperor | null>(null)
  const [emperors, setEmperors] = useState<Emperor[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEmperors()
    loadTasks()
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentHour = new Date().getHours()
      if (emperors.length > 0) {
        const emperorIndex = currentHour % emperors.length
        setCurrentEmperor(emperors[emperorIndex])
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [emperors])

  const loadEmperors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/emperors_lat_jp.csv')
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
        const currentHour = new Date().getHours()
        setCurrentEmperor(emperorData[currentHour % emperorData.length])
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
      
      <main className="app-main">
        {/* Emperor section first */}
        {currentEmperor && (
          <div className="emperor-section">
            <EmperorDisplay emperor={currentEmperor} />
          </div>
        )}
        
        {/* Timer section second */}
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
        
        {/* Tasks section last */}
        <div className="tasks-section">
          <TaskManager tasks={tasks} onTasksChange={saveTasks} />
        </div>
      </main>
    </div>
  )
}

export default App