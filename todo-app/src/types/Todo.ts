export interface Todo {
  id: string
  text: string
  completed: boolean
  dueDate?: Date
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateTodoData {
  text: string
  dueDate?: Date
  tags: string[]
}

export interface UpdateTodoData {
  text?: string
  completed?: boolean
  dueDate?: Date
  tags?: string[]
}
