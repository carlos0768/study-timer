import { useState } from 'react'
import type { Task } from '../types'
// ラテン語変換・アイコン機能は廃止

interface TaskManagerProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
  onTaskStart?: () => void
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onTasksChange, onTaskStart }) => {
  const [newTaskLabel, setNewTaskLabel] = useState('')
  const [newTaskEstimate, setNewTaskEstimate] = useState(25)

  const addTask = () => {
    if (newTaskLabel.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        label: newTaskLabel,
        status: 'todo',
        estimate_min: newTaskEstimate
      }
      onTasksChange([...tasks, newTask])
      setNewTaskLabel('')
      setNewTaskEstimate(25)
    }
  }

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    )
    onTasksChange(updatedTasks)
    
    // Auto-start timer when task is started
    if (status === 'in_progress') {
      onTaskStart?.()
    }
  }

  const deleteTask = (taskId: string) => {
    onTasksChange(tasks.filter(task => task.id !== taskId))
  }

  const getStatusIcon = (status: Task['status']) => {
    // CSSで装飾するためclass名のみ返す
    return `status-dot ${status}`
  }

  const getStatusClass = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'task-todo'
      case 'in_progress': return 'task-in-progress'
      case 'done': return 'task-done'
    }
  }

  return (
    <div className="task-manager">
      <h2>Today's Tasks</h2>
      
      <div className="task-input">
        <input
          type="text"
          placeholder="Task description"
          value={newTaskLabel}
          onChange={(e) => setNewTaskLabel(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <input
          type="number"
          min="1"
          max="180"
          value={newTaskEstimate}
          onChange={(e) => setNewTaskEstimate(parseInt(e.target.value) || 1)}
          placeholder="min"
        />
        <button className="btn btn-primary" onClick={addTask}>追加</button>
      </div>

      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className={`task-item ${getStatusClass(task.status)}`}>
            <span className={getStatusIcon(task.status)}></span>
            <span className="task-label">{task.label}</span>
            <span className="task-estimate">{task.estimate_min}min</span>
            <div className="task-actions">
              {task.status !== 'done' && (
                <>
                  {task.status === 'todo' && (
                    <button className="task-start-btn" onClick={() => updateTaskStatus(task.id, 'in_progress')}>開始</button>
                  )}
                  {task.status === 'in_progress' && (
                    <button className="task-done-btn" onClick={() => updateTaskStatus(task.id, 'done')}>完了</button>
                  )}
                </>
              )}
              <button onClick={() => deleteTask(task.id)}>×</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default TaskManager