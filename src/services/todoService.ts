import { db } from './database'
import type { TodoItem, Tag, ItemTag } from '@/types/todo'
import type { TodoService as ITodoService } from '@/types/database'

export class TodoService implements ITodoService {
  // Todo CRUD operations
  async getAllTodos(): Promise<TodoItem[]> {
    try {
      return await db.items.orderBy('createdAt').reverse().toArray()
    } catch (error) {
      console.error('Failed to get todos:', error)
      throw new Error('Failed to load todos')
    }
  }

  async getTodoById(id: number): Promise<TodoItem | undefined> {
    try {
      return await db.items.get(id)
    } catch (error) {
      console.error('Failed to get todo by id:', error)
      throw new Error('Failed to load todo')
    }
  }

  async createTodo(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      const now = new Date()
      const newTodo: Omit<TodoItem, 'id'> = {
        ...todo,
        createdAt: now,
        updatedAt: now
      }
      return await db.items.add(newTodo)
    } catch (error) {
      console.error('Failed to create todo:', error)
      throw new Error('Failed to create todo')
    }
  }

  async updateTodo(id: number, updates: Partial<TodoItem>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      }
      await db.items.update(id, updateData)
    } catch (error) {
      console.error('Failed to update todo:', error)
      throw new Error('Failed to update todo')
    }
  }

  async deleteTodo(id: number): Promise<void> {
    try {
      // Delete the todo and its tag relationships
      await db.transaction('rw', db.items, db.itemTags, async () => {
        await db.items.delete(id)
        await db.itemTags.where('itemId').equals(id).delete()
      })
    } catch (error) {
      console.error('Failed to delete todo:', error)
      throw new Error('Failed to delete todo')
    }
  }

  async toggleTodoComplete(id: number): Promise<void> {
    try {
      const todo = await db.items.get(id)
      if (todo) {
        await this.updateTodo(id, { completed: !todo.completed })
      }
    } catch (error) {
      console.error('Failed to toggle todo completion:', error)
      throw new Error('Failed to toggle todo completion')
    }
  }

  // Tag operations
  async getAllTags(): Promise<Tag[]> {
    try {
      return await db.tags.orderBy('name').toArray()
    } catch (error) {
      console.error('Failed to get tags:', error)
      throw new Error('Failed to load tags')
    }
  }

  async createTag(tag: Omit<Tag, 'id' | 'createdAt'>): Promise<number> {
    try {
      const newTag: Omit<Tag, 'id'> = {
        ...tag,
        createdAt: new Date()
      }
      return await db.tags.add(newTag)
    } catch (error) {
      console.error('Failed to create tag:', error)
      throw new Error('Failed to create tag')
    }
  }

  async deleteTag(id: number): Promise<void> {
    try {
      // Delete the tag and its relationships
      await db.transaction('rw', db.tags, db.itemTags, async () => {
        await db.tags.delete(id)
        await db.itemTags.where('tagId').equals(id).delete()
      })
    } catch (error) {
      console.error('Failed to delete tag:', error)
      throw new Error('Failed to delete tag')
    }
  }

  // Tag-Todo relationships
  async addTagToTodo(todoId: number, tagId: number): Promise<void> {
    try {
      // Check if relationship already exists
      const existing = await db.itemTags
        .where('[itemId+tagId]')
        .equals([todoId, tagId])
        .first()
      
      if (!existing) {
        await db.itemTags.add({ itemId: todoId, tagId })
      }
    } catch (error) {
      console.error('Failed to add tag to todo:', error)
      throw new Error('Failed to add tag to todo')
    }
  }

  async removeTagFromTodo(todoId: number, tagId: number): Promise<void> {
    try {
      await db.itemTags
        .where('[itemId+tagId]')
        .equals([todoId, tagId])
        .delete()
    } catch (error) {
      console.error('Failed to remove tag from todo:', error)
      throw new Error('Failed to remove tag from todo')
    }
  }

  async getTodoTags(todoId: number): Promise<Tag[]> {
    try {
      const itemTags = await db.itemTags.where('itemId').equals(todoId).toArray()
      const tagIds = itemTags.map(it => it.tagId)
      return await db.tags.where('id').anyOf(tagIds).toArray()
    } catch (error) {
      console.error('Failed to get todo tags:', error)
      throw new Error('Failed to load todo tags')
    }
  }

  async getTagTodos(tagId: number): Promise<TodoItem[]> {
    try {
      const itemTags = await db.itemTags.where('tagId').equals(tagId).toArray()
      const todoIds = itemTags.map(it => it.itemId)
      return await db.items.where('id').anyOf(todoIds).toArray()
    } catch (error) {
      console.error('Failed to get tag todos:', error)
      throw new Error('Failed to load tag todos')
    }
  }

  // Bulk operations
  async clearCompletedTodos(): Promise<void> {
    try {
      const completedTodos = await db.items.where('completed').equals(true).toArray()
      const completedIds = completedTodos.map(todo => todo.id!).filter(id => id !== undefined)
      
      await db.transaction('rw', db.items, db.itemTags, async () => {
        await db.items.where('id').anyOf(completedIds).delete()
        await db.itemTags.where('itemId').anyOf(completedIds).delete()
      })
    } catch (error) {
      console.error('Failed to clear completed todos:', error)
      throw new Error('Failed to clear completed todos')
    }
  }

  async deleteAllTodos(): Promise<void> {
    try {
      await db.transaction('rw', db.items, db.itemTags, async () => {
        await db.items.clear()
        await db.itemTags.clear()
      })
    } catch (error) {
      console.error('Failed to delete all todos:', error)
      throw new Error('Failed to delete all todos')
    }
  }
}

// Create service instance
export const todoService = new TodoService()
