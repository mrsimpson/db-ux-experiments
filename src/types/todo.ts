// Core Types
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type FilterType = 'all' | 'active' | 'completed'

// Database Entities
export interface TodoItem {
  id?: number
  text: string
  completed: boolean
  priority: Priority
  dueDate?: string
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id?: number
  name: string
  color: string
  createdAt: Date
}

export interface ItemTag {
  id?: number
  itemId: number
  tagId: number
}

// Form Types
export interface TodoFormData {
  text: string
  priority: Priority
  dueDate?: string
  tagIds: number[]
}

export interface TagFormData {
  name: string
  color: string
}

// Component Props
export interface TodoItemProps {
  todo: TodoItem
  tags: Tag[]
  onUpdate: (id: number, updates: Partial<TodoItem>) => void
  onDelete: (id: number) => void
  onToggle: (id: number) => void
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
