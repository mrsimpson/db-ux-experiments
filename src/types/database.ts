import type { TodoItem, Tag, ItemTag } from './todo'

// Database Service Interface
export interface TodoService {
  // Todo CRUD operations
  getAllTodos(): Promise<TodoItem[]>
  getTodoById(id: number): Promise<TodoItem | undefined>
  createTodo(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<number>
  updateTodo(id: number, updates: Partial<TodoItem>): Promise<void>
  deleteTodo(id: number): Promise<void>
  toggleTodoComplete(id: number): Promise<void>
  
  // Tag operations
  getAllTags(): Promise<Tag[]>
  createTag(tag: Omit<Tag, 'id' | 'createdAt'>): Promise<number>
  deleteTag(id: number): Promise<void>
  
  // Tag-Todo relationships
  addTagToTodo(todoId: number, tagId: number): Promise<void>
  removeTagFromTodo(todoId: number, tagId: number): Promise<void>
  getTodoTags(todoId: number): Promise<Tag[]>
  getTagTodos(tagId: number): Promise<TodoItem[]>
  
  // Bulk operations
  clearCompletedTodos(): Promise<void>
  deleteAllTodos(): Promise<void>
}

// Database initialization
export interface DatabaseService {
  initialize(): Promise<void>
  reset(): Promise<void>
  export(): Promise<string>
  import(data: string): Promise<void>
}
