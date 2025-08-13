<template>
  <div :class="appClasses">
    <DBSection class="todo-app">
      <DBStack gap="large">
        <!-- Header -->
        <DBCard>
          <DBStack gap="medium">
            <h1>Personal Todo App</h1>
            <p>A technical showcase using db-ux components with offline-first architecture</p>
          </DBStack>
        </DBCard>

        <!-- Error Display -->
        <DBNotification 
          v-if="error" 
          variant="critical"
          @close="clearError"
        >
          {{ error }}
        </DBNotification>

        <!-- Loading State -->
        <DBCard v-if="isLoading">
          <p>Loading todos...</p>
        </DBCard>

        <!-- Todo Form -->
        <TodoForm @submit="handleCreateTodo" />

        <!-- Tag Filter -->
        <TagFilter 
          :available-tags="availableTags"
          :selected-tags="selectedTags"
          @update-filter="setTagFilter"
          @clear-filter="clearTagFilter"
        />

        <!-- Stats -->
        <DBCard>
          <DBStack direction="horizontal" gap="large">
            <div>
              <strong>{{ pendingCount }}</strong> pending
            </div>
            <div>
              <strong>{{ completedCount }}</strong> completed
            </div>
            <div>
              <strong>{{ todos.length }}</strong> total
            </div>
          </DBStack>
        </DBCard>

        <!-- Todo List -->
        <TodoList 
          :todos="filteredTodos"
          @toggle="toggleTodo"
          @edit="handleEditTodo"
          @delete="deleteTodo"
        />
      </DBStack>
    </DBSection>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { DBSection, DBStack, DBCard, DBNotification } from '@db-ux/v-core-components'
import { useTodoStore } from '@/composables/useTodoStore'
import type { CreateTodoData, UpdateTodoData } from '@/types/Todo'
import TodoForm from '@/components/TodoForm.vue'
import TodoList from '@/components/TodoList.vue'
import TagFilter from '@/components/TagFilter.vue'

// Use the todo store
const {
  todos,
  filteredTodos,
  selectedTags,
  availableTags,
  completedCount,
  pendingCount,
  isLoading,
  error,
  initializeStore,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  setTagFilter,
  clearTagFilter,
  clearError
} = useTodoStore()

// App styling following db-ux patterns
const appClasses = computed(() => 'db-density-regular db-neutral-bg-level-1')

// Event handlers
const handleCreateTodo = async (data: CreateTodoData) => {
  try {
    await createTodo(data)
  } catch (error) {
    // Error is handled by the store
    console.error('Failed to create todo:', error)
  }
}

const handleEditTodo = async (id: string, updates: UpdateTodoData) => {
  try {
    await updateTodo(id, updates)
  } catch (error) {
    // Error is handled by the store
    console.error('Failed to update todo:', error)
  }
}

// Initialize the app
onMounted(async () => {
  await initializeStore()
})
</script>

<style scoped>
.todo-app {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

p {
  margin: 0;
  color: var(--db-color-neutral-text-weak);
}
</style>
