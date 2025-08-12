<template>
  <div class="filter-controls">
    <div class="filter-buttons">
      <DBButton
        v-for="filterOption in filterOptions"
        :key="filterOption.value"
        @click="setFilter(filterOption.value)"
        :variant="todoStore.filter === filterOption.value ? 'primary' : 'secondary'"
        class="filter-button"
      >
        {{ filterOption.label }}
        <span class="filter-count">({{ getFilterCount(filterOption.value) }})</span>
      </DBButton>
    </div>

    <div class="filter-actions">
      <DBButton
        v-if="todoStore.todoStats.completed > 0"
        @click="clearCompleted"
        variant="ghost"
        :disabled="isClearing"
      >
        {{ isClearing ? 'Clearing...' : `Clear Completed (${todoStore.todoStats.completed})` }}
      </DBButton>
    </div>

    <div class="todo-stats">
      <span class="stat-item">
        <strong>{{ todoStore.todoStats.total }}</strong> total
      </span>
      <span class="stat-item">
        <strong>{{ todoStore.todoStats.active }}</strong> active
      </span>
      <span class="stat-item">
        <strong>{{ todoStore.todoStats.completed }}</strong> completed
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DBButton } from '@db-ux/v-core-components'
import { useTodoStore } from '@/stores/todoStore'
import type { FilterType } from '@/types/todo'

const todoStore = useTodoStore()
const isClearing = ref(false)

const filterOptions = [
  { value: 'all' as FilterType, label: 'All' },
  { value: 'active' as FilterType, label: 'Active' },
  { value: 'completed' as FilterType, label: 'Completed' }
]

function setFilter(filter: FilterType) {
  todoStore.setFilter(filter)
}

function getFilterCount(filter: FilterType): number {
  switch (filter) {
    case 'all':
      return todoStore.todoStats.total
    case 'active':
      return todoStore.todoStats.active
    case 'completed':
      return todoStore.todoStats.completed
    default:
      return 0
  }
}

async function clearCompleted() {
  if (todoStore.todoStats.completed === 0) return
  
  const confirmed = confirm(`Are you sure you want to delete ${todoStore.todoStats.completed} completed todos?`)
  if (!confirmed) return

  try {
    isClearing.value = true
    await todoStore.clearCompleted()
  } catch (error) {
    console.error('Failed to clear completed todos:', error)
  } finally {
    isClearing.value = false
  }
}
</script>

<style scoped>
.filter-controls {
  background: var(--db-color-bg-basic-level-1);
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--db-color-border-basic-level-1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .filter-controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-count {
  font-size: 0.75rem;
  opacity: 0.8;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.todo-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--db-color-text-secondary);
}

@media (max-width: 767px) {
  .todo-stats {
    justify-content: center;
  }
}

.stat-item strong {
  color: var(--db-color-text-primary);
}
</style>
