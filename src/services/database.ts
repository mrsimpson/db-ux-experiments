import Dexie, { type Table } from 'dexie'
import type { TodoItem, Tag, ItemTag } from '@/types/todo'

export class TodoDatabase extends Dexie {
  items!: Table<TodoItem>
  tags!: Table<Tag>
  itemTags!: Table<ItemTag>

  constructor() {
    super('TodoDatabase')
    
    this.version(1).stores({
      items: '++id, text, completed, priority, dueDate, createdAt, updatedAt',
      tags: '++id, &name, color, createdAt', // &name = unique index
      itemTags: '++id, itemId, tagId, [itemId+tagId]' // compound index
    })
  }
}

// Create database instance
export const db = new TodoDatabase()

// Initialize database with default data if needed
export async function initializeDatabase(): Promise<void> {
  try {
    await db.open()
    
    // Check if we need to add default tags
    const tagCount = await db.tags.count()
    if (tagCount === 0) {
      // Add some default tags
      await db.tags.bulkAdd([
        { name: 'Work', color: '#1976d2', createdAt: new Date() },
        { name: 'Personal', color: '#388e3c', createdAt: new Date() },
        { name: 'Urgent', color: '#d32f2f', createdAt: new Date() },
        { name: 'Ideas', color: '#7b1fa2', createdAt: new Date() }
      ])
    }
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}
