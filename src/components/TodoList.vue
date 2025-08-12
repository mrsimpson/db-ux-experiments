<template>
  <div class="todo-list-container">
    <div v-if="todoStore.filteredTodos.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>{{ getEmptyStateTitle() }}</h3>
      <p>{{ getEmptyStateMessage() }}</p>
    </div>

    <div v-else class="todo-list">
      <TodoItem
        v-for="todo in todoStore.filteredTodos"
        :key="todo.id"
        :todo="todo"
        @update="handleUpdateTodo"
        @delete="handleDeleteTodo"
        @toggle="handleToggleTodo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from '@/stores/todoStore'
import TodoItem from './TodoItem.vue'
import type { TodoItem as TodoItemType } from '@/types/todo'

const todoStore = useTodoStore()

function getEmptyStateTitle(): string {
  switch (todoStore.filter) {
    case 'active':
      return 'No active todos'
    case 'completed':
      return 'No completed todos'
    default:
      return 'No todos yet'
  }
}

function getEmptyStateMessage(): string {
  switch (todoStore.filter) {
    case 'active':
      return 'All your todos are completed! 🎉'
    case 'completed':
      return 'No completed todos to show.'
    default:
      return 'Add your first todo above to get started!'
  }
}

async function handleUpdateTodo(id: number, updates: Partial<TodoItemType>) {
  try {
    await todoStore.updateTodo(id, updates)
  } catch (error) {
    console.error('Failed to update todo:', error)
  }
}

async function handleDeleteTodo(id: number) {
  const confirmed = confirm('Are you sure you want to delete this todo?')
  if (!confirmed) return

  try {
    await todoStore.deleteTodo(id)
  } catch (error) {
    console.error('Failed to delete todo:', error)
  }
}

async function handleToggleTodo(id: number) {
  try {
    await todoStore.toggleComplete(id)
  } catch (error) {
    console.error('Failed to toggle todo:', error)
  }
}
</script>

<style scoped>
.todo-list-container {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--db-color-text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--db-color-text-primary);
}

.empty-state p {
  font-size: 1rem;
  line-height: 1.5;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
