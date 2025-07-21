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


export interface TimerSettings {
  countdownMinutes: number
}

export interface StudyLog {
  date: string
  totalMinutes: number
  completedTasks: string[]
}