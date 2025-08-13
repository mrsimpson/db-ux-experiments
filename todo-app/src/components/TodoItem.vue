<template>
  <DBCard :class="{ 'completed': todo.completed }">
    <DBStack gap="medium">
      <!-- Main todo content -->
      <DBStack direction="horizontal" gap="medium" alignment="start">
        <!-- Completion checkbox -->
        <DBCheckbox
          :checked="todo.completed"
          @change="$emit('toggle')"
          :aria-label="`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`"
        />
        
        <!-- Todo content -->
        <div class="todo-content">
          <div class="todo-text" :class="{ 'completed-text': todo.completed }">
            {{ todo.text }}
          </div>
          
          <!-- Due date -->
          <div v-if="todo.dueDate" class="todo-meta">
            <DBIcon name="calendar" size="small" />
            <span :class="{ 'overdue': isOverdue }">
              Due: {{ formatDate(todo.dueDate) }}
            </span>
          </div>
          
          <!-- Tags -->
          <div v-if="todo.tags.length > 0" class="todo-tags">
            <DBStack direction="horizontal" gap="small">
              <DBTag
                v-for="tag in todo.tags"
                :key="tag"
                size="small"
              >
                {{ tag }}
              </DBTag>
            </DBStack>
          </div>
          
          <!-- Timestamps -->
          <div class="todo-timestamps">
            <small>
              Created: {{ formatDateTime(todo.createdAt) }}
              <span v-if="todo.updatedAt.getTime() !== todo.createdAt.getTime()">
                • Updated: {{ formatDateTime(todo.updatedAt) }}
              </span>
            </small>
          </div>
        </div>
      </DBStack>
      
      <!-- Action buttons -->
      <DBStack direction="horizontal" gap="small" alignment="end">
        <DBButton
          variant="ghost"
          size="small"
          @click="startEdit"
        >
          Edit
        </DBButton>
        <DBButton
          variant="critical"
          size="small"
          @click="confirmDelete"
        >
          Delete
        </DBButton>
      </DBStack>
    </DBStack>
  </DBCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DBCard, DBStack, DBCheckbox, DBIcon, DBTag, DBButton } from '@db-ux/v-core-components'
import type { Todo, UpdateTodoData } from '@/types/Todo'

// Props
interface Props {
  todo: Todo
}

const props = defineProps<Props>()

// Emits
interface Emits {
  toggle: []
  edit: [updates: UpdateTodoData]
  delete: []
}

const emit = defineEmits<Emits>()

// Computed properties
const isOverdue = computed(() => {
  if (!props.todo.dueDate || props.todo.completed) return false
  return props.todo.dueDate < new Date()
})

// Methods
const formatDate = (date: Date): string => {
  return date.toLocaleDateString()
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString()
}

const startEdit = () => {
  // For now, just show an alert - we'll implement proper editing later
  alert('Edit functionality will be implemented in the next phase')
}

const confirmDelete = () => {
  if (confirm(`Are you sure you want to delete "${props.todo.text}"?`)) {
    emit('delete')
  }
}
</script>

<style scoped>
.completed {
  opacity: 0.7;
}

.todo-content {
  flex: 1;
  min-width: 0; /* Allow text to wrap */
}

.todo-text {
  font-weight: 500;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
}

.completed-text {
  text-decoration: line-through;
  color: var(--db-color-neutral-text-weak);
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--db-color-neutral-text-weak);
}

.overdue {
  color: var(--db-color-critical-text-strong);
  font-weight: 600;
}

.todo-tags {
  margin-bottom: 0.5rem;
}

.todo-timestamps {
  color: var(--db-color-neutral-text-weak);
}

small {
  font-size: 0.75rem;
}
</style>
