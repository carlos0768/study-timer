export interface Emperor {
  id: number
  name: string
  quoteLatin: string
  quoteJp: string
  img: string
}

export interface Task {
  id: string
  label: string
  status: 'todo' | 'in_progress' | 'done'
  estimate_min: number
}

export type TimerMode = 'countdown' | 'pomodoro'

export interface TimerSettings {
  countdownMinutes: number
  pomodoroWorkMinutes: number
  pomodoroBreakMinutes: number
}

export interface StudyLog {
  date: string
  totalMinutes: number
  completedTasks: string[]
}