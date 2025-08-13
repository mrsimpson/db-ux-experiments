<template>
  <div>
    <h2>Todos</h2>
    
    <div v-if="todos.length === 0" class="empty-state">
      <DBCard>
        <DBStack gap="medium" alignment="center">
          <DBIcon name="task" size="large" />
          <p>No todos yet. Create your first todo above!</p>
        </DBStack>
      </DBCard>
    </div>
    
    <DBStack v-else gap="medium">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="$emit('toggle', todo.id)"
        @edit="$emit('edit', todo.id, $event)"
        @delete="$emit('delete', todo.id)"
      />
    </DBStack>
  </div>
</template>

<script setup lang="ts">
import { DBCard, DBStack, DBIcon } from '@db-ux/v-core-components'
import type { Todo, UpdateTodoData } from '@/types/Todo'
import TodoItem from './TodoItem.vue'

// Props
interface Props {
  todos: Todo[]
}

defineProps<Props>()

// Emits
interface Emits {
  toggle: [id: string]
  edit: [id: string, updates: UpdateTodoData]
  delete: [id: string]
}

defineEmits<Emits>()
</script>

<style scoped>
.empty-state {
  text-align: center;
  color: var(--db-color-neutral-text-weak);
}

h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

p {
  margin: 0;
}
</style>
