export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string // ISO date string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  customer?: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

export type TaskStatus = Task['status']
export type TaskPriority = Task['priority']

export interface TaskStats {
  pending: number
  overdue: number
  dueToday: number
  approachingBreach: number
  total: number
}

export type SortOption = 'priority' | 'status' | 'dueDate' | 'customer' | 'createdAt'
export type ViewMode = 'list' | 'cards'
