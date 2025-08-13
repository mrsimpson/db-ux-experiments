import type { Todo, CreateTodoData, UpdateTodoData } from '@/types/Todo'

export class IndexedDBService {
  private db: IDBDatabase | null = null
  private readonly dbName = 'TodoApp'
  private readonly dbVersion = 1
  private readonly storeName = 'todos'

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create todos object store
        const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
        
        // Create indexes for efficient querying
        store.createIndex('completed', 'completed', { unique: false })
        store.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        store.createIndex('dueDate', 'dueDate', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    })
  }

  private generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async createTodo(data: CreateTodoData): Promise<Todo> {
    if (!this.db) throw new Error('Database not initialized')

    const now = new Date()
    const todo: Todo = {
      id: this.generateId(),
      text: data.text.trim(),
      completed: false,
      dueDate: data.dueDate,
      tags: data.tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
      createdAt: now,
      updatedAt: now
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(todo)

      request.onsuccess = () => resolve(todo)
      request.onerror = () => reject(new Error('Failed to create todo'))
    })
  }

  async getTodos(): Promise<Todo[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const todos = request.result.map(todo => ({
          ...todo,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        }))
        resolve(todos)
      }
      request.onerror = () => reject(new Error('Failed to get todos'))
    })
  }

  async updateTodo(id: string, updates: UpdateTodoData): Promise<Todo> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const existingTodo = getRequest.result
        if (!existingTodo) {
          reject(new Error('Todo not found'))
          return
        }

        const updatedTodo: Todo = {
          ...existingTodo,
          ...updates,
          updatedAt: new Date()
        }

        // Clean up tags if provided
        if (updates.tags) {
          updatedTodo.tags = updates.tags.map(tag => tag.trim()).filter(tag => tag.length > 0)
        }

        const putRequest = store.put(updatedTodo)
        putRequest.onsuccess = () => resolve(updatedTodo)
        putRequest.onerror = () => reject(new Error('Failed to update todo'))
      }

      getRequest.onerror = () => reject(new Error('Failed to find todo'))
    })
  }

  async deleteTodo(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to delete todo'))
    })
  }

  async getTodosByTag(tag: string): Promise<Todo[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('tags')
      const request = index.getAll(tag)

      request.onsuccess = () => {
        const todos = request.result.map(todo => ({
          ...todo,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        }))
        resolve(todos)
      }
      request.onerror = () => reject(new Error('Failed to get todos by tag'))
    })
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService()
