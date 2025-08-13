import { ref, computed, readonly } from 'vue'
import type { Todo, CreateTodoData, UpdateTodoData } from '@/types/Todo'
import { indexedDBService } from '@/services/IndexedDBService'

// Global reactive state
const todos = ref<Todo[]>([])
const selectedTags = ref<string[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useTodoStore() {
  // Computed properties
  const filteredTodos = computed(() => {
    if (selectedTags.value.length === 0) {
      return todos.value
    }
    return todos.value.filter(todo =>
      selectedTags.value.some(tag => todo.tags.includes(tag))
    )
  })

  const availableTags = computed(() => {
    const tagSet = new Set<string>()
    todos.value.forEach(todo => {
      todo.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  const completedCount = computed(() => 
    todos.value.filter(todo => todo.completed).length
  )

  const pendingCount = computed(() => 
    todos.value.filter(todo => !todo.completed).length
  )

  // Actions
  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const initializeStore = async () => {
    try {
      isLoading.value = true
      clearError()
      await indexedDBService.init()
      await loadTodos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize store')
    } finally {
      isLoading.value = false
    }
  }

  const loadTodos = async () => {
    try {
      isLoading.value = true
      clearError()
      const loadedTodos = await indexedDBService.getTodos()
      todos.value = loadedTodos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos')
    } finally {
      isLoading.value = false
    }
  }

  const createTodo = async (data: CreateTodoData) => {
    try {
      clearError()
      const newTodo = await indexedDBService.createTodo(data)
      todos.value.unshift(newTodo) // Add to beginning for newest first
      return newTodo
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo')
      throw err
    }
  }

  const updateTodo = async (id: string, updates: UpdateTodoData) => {
    try {
      clearError()
      const updatedTodo = await indexedDBService.updateTodo(id, updates)
      const index = todos.value.findIndex(todo => todo.id === id)
      if (index !== -1) {
        todos.value[index] = updatedTodo
      }
      return updatedTodo
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo')
      throw err
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      clearError()
      await indexedDBService.deleteTodo(id)
      const index = todos.value.findIndex(todo => todo.id === id)
      if (index !== -1) {
        todos.value.splice(index, 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
      throw err
    }
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      await updateTodo(id, { completed: !todo.completed })
    }
  }

  const setTagFilter = (tags: string[]) => {
    selectedTags.value = [...tags]
  }

  const addTagFilter = (tag: string) => {
    if (!selectedTags.value.includes(tag)) {
      selectedTags.value.push(tag)
    }
  }

  const removeTagFilter = (tag: string) => {
    const index = selectedTags.value.indexOf(tag)
    if (index !== -1) {
      selectedTags.value.splice(index, 1)
    }
  }

  const clearTagFilter = () => {
    selectedTags.value = []
  }

  return {
    // Readonly state
    todos: readonly(todos),
    filteredTodos,
    selectedTags: readonly(selectedTags),
    availableTags,
    completedCount,
    pendingCount,
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Actions
    initializeStore,
    loadTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    setTagFilter,
    addTagFilter,
    removeTagFilter,
    clearTagFilter,
    clearError
  }
}
