<template>
  <div class="todo-app">
    <header class="app-header">
      <h1>Todo App</h1>
      <p v-if="todoStore.error" class="error-message">
        {{ todoStore.error }}
        <button @click="todoStore.clearError()" class="error-dismiss">×</button>
      </p>
    </header>

    <main class="app-main">
      <TodoForm />
      <FilterControls />
      <TodoList />
    </main>

    <div v-if="todoStore.loading" class="loading-overlay">
      <div class="loading-spinner">Loading...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTodoStore } from '@/stores/todoStore'
import TodoForm from '@/components/TodoForm.vue'
import FilterControls from '@/components/FilterControls.vue'
import TodoList from '@/components/TodoList.vue'

const todoStore = useTodoStore()

onMounted(async () => {
  await todoStore.initialize()
})
</script>

<style scoped>
.todo-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  position: relative;
}

@media (min-width: 768px) {
  .todo-app {
    padding: 2rem;
  }
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--db-color-text-primary);
  margin-bottom: 0.5rem;
}

.error-message {
  background-color: var(--db-color-bg-danger);
  color: var(--db-color-text-on-danger);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-dismiss {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: 1rem;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}
</style>
