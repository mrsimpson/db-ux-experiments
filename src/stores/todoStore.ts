import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TodoItem, Tag, FilterType, Priority } from '@/types/todo'
import { todoService } from '@/services/todoService'
import { initializeDatabase } from '@/services/database'

export const useTodoStore = defineStore('todo', () => {
  // State
  const todos = ref<TodoItem[]>([])
  const tags = ref<Tag[]>([])
  const filter = ref<FilterType>('all')
  const selectedTags = ref<number[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const filteredTodos = computed(() => {
    let filtered = todos.value

    // Filter by completion status
    if (filter.value === 'active') {
      filtered = filtered.filter(t => !t.completed)
    } else if (filter.value === 'completed') {
      filtered = filtered.filter(t => t.completed)
    }

    // Note: Tag filtering would require async operations, so we'll handle it in the component level for now
    // This is a limitation of computed properties with async operations

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  })

  const todoStats = computed(() => ({
    total: todos.value.length,
    active: todos.value.filter(t => !t.completed).length,
    completed: todos.value.filter(t => t.completed).length
  }))

  // Actions
  async function initialize() {
    try {
      loading.value = true
      error.value = null
      
      await initializeDatabase()
      await loadTodos()
      await loadTags()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize'
      console.error('Failed to initialize store:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadTodos() {
    try {
      todos.value = await todoService.getAllTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load todos'
      throw err
    }
  }

  async function loadTags() {
    try {
      tags.value = await todoService.getAllTags()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tags'
      throw err
    }
  }

  async function addTodo(todoData: {
    text: string
    priority: Priority
    dueDate?: string
    tagIds?: number[]
  }) {
    try {
      loading.value = true
      error.value = null

      const todoId = await todoService.createTodo({
        text: todoData.text,
        priority: todoData.priority,
        dueDate: todoData.dueDate,
        completed: false
      })

      // Add tag relationships if provided
      if (todoData.tagIds && todoData.tagIds.length > 0) {
        for (const tagId of todoData.tagIds) {
          await todoService.addTagToTodo(todoId, tagId)
        }
      }

      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add todo'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTodo(id: number, updates: Partial<TodoItem>) {
    try {
      loading.value = true
      error.value = null

      await todoService.updateTodo(id, updates)
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update todo'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTodo(id: number) {
    try {
      loading.value = true
      error.value = null

      await todoService.deleteTodo(id)
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete todo'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleComplete(id: number) {
    try {
      await todoService.toggleTodoComplete(id)
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to toggle todo'
      throw err
    }
  }

  async function addTag(tagData: { name: string; color: string }) {
    try {
      loading.value = true
      error.value = null

      await todoService.createTag(tagData)
      await loadTags()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add tag'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTag(id: number) {
    try {
      loading.value = true
      error.value = null

      await todoService.deleteTag(id)
      await loadTags()
      await loadTodos() // Reload todos to reflect tag removal
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete tag'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addTagToTodo(todoId: number, tagId: number) {
    try {
      await todoService.addTagToTodo(todoId, tagId)
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add tag to todo'
      throw err
    }
  }

  async function removeTagFromTodo(todoId: number, tagId: number) {
    try {
      await todoService.removeTagFromTodo(todoId, tagId)
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove tag from todo'
      throw err
    }
  }

  function setFilter(newFilter: FilterType) {
    filter.value = newFilter
  }

  function setSelectedTags(tagIds: number[]) {
    selectedTags.value = tagIds
  }

  async function clearCompleted() {
    try {
      loading.value = true
      error.value = null

      await todoService.clearCompletedTodos()
      await loadTodos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to clear completed todos'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    todos,
    tags,
    filter,
    selectedTags,
    loading,
    error,
    
    // Getters
    filteredTodos,
    todoStats,
    
    // Actions
    initialize,
    loadTodos,
    loadTags,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    addTag,
    deleteTag,
    addTagToTodo,
    removeTagFromTodo,
    setFilter,
    setSelectedTags,
    clearCompleted,
    clearError,
    
    // Expose service for components that need direct access
    todoService
  }
})
