<template>
  <div class="todo-item" :class="{ 'todo-item--completed': todo.completed }">
    <div class="todo-checkbox">
      <DBCheckbox
        :id="`todo-${todo.id}`"
        :checked="todo.completed"
        @change="$emit('toggle', todo.id)"
      />
    </div>

    <div class="todo-content">
      <div v-if="!isEditing" class="todo-display">
        <span class="todo-text" :class="{ 'todo-text--completed': todo.completed }">
          {{ todo.text }}
        </span>
        <div class="todo-meta">
          <DBTag class="todo-priority" :emphasis="getPriorityEmphasis(todo.priority)">
            {{ getPriorityLabel(todo.priority) }}
          </DBTag>
          <span v-if="todo.dueDate" class="todo-due-date" :class="getDueDateClass()">
            {{ formatDueDate(todo.dueDate) }}
          </span>
        </div>
        <div v-if="todoTags.length > 0" class="todo-tags">
          <DBTag
            v-for="tag in todoTags"
            :key="tag.id"
            class="todo-tag"
            :style="{ '--db-tag-bg-color': tag.color }"
          >
            {{ tag.name }}
          </DBTag>
        </div>
      </div>

      <div v-else class="todo-edit">
        <DBInput
          v-model:value="editData.text"
          ref="editInput"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
        />
        <DBSelect v-model:value="editData.priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </DBSelect>
        <DBInput
          v-model:value="editData.dueDate"
          type="date"
        />
      </div>
    </div>

    <div class="todo-actions">
      <DBButton
        v-if="!isEditing"
        @click="startEdit"
        variant="ghost"
        size="small"
        no-text
        title="Edit todo"
      >
        ✏️
      </DBButton>
      <template v-else>
        <DBButton
          @click="saveEdit"
          variant="primary"
          size="small"
          no-text
          title="Save changes"
        >
          ✓
        </DBButton>
        <DBButton
          @click="cancelEdit"
          variant="secondary"
          size="small"
          no-text
          title="Cancel editing"
        >
          ✕
        </DBButton>
      </template>
      <DBButton
        v-if="!isEditing"
        @click="$emit('delete', todo.id)"
        variant="ghost"
        size="small"
        no-text
        title="Delete todo"
      >
        🗑️
      </DBButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { DBCheckbox, DBTag, DBInput, DBSelect, DBButton } from '@db-ux/v-core-components'
import { useTodoStore } from '@/stores/todoStore'
import { formatDate, isOverdue, isToday } from '@/utils/dateUtils'
import type { TodoItem, Tag, Priority } from '@/types/todo'

interface Props {
  todo: TodoItem
}

interface Emits {
  (e: 'update', id: number, updates: Partial<TodoItem>): void
  (e: 'delete', id: number): void
  (e: 'toggle', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const todoStore = useTodoStore()
const isEditing = ref(false)
const editInput = ref<HTMLInputElement>()
const todoTags = ref<Tag[]>([])

const editData = reactive({
  text: '',
  priority: 'medium' as Priority,
  dueDate: ''
})

onMounted(async () => {
  await loadTodoTags()
})

async function loadTodoTags() {
  if (props.todo.id) {
    try {
      todoTags.value = await todoStore.todoService.getTodoTags(props.todo.id)
    } catch (error) {
      console.error('Failed to load todo tags:', error)
      todoTags.value = []
    }
  }
}

function getPriorityLabel(priority: Priority): string {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical'
  }
  return labels[priority]
}

function getPriorityEmphasis(priority: Priority): string {
  const emphasisMap = {
    low: 'successful',
    medium: 'warning',
    high: 'critical',
    critical: 'critical'
  }
  return emphasisMap[priority]
}

function formatDueDate(dateString: string): string {
  return formatDate(dateString)
}

function getDueDateClass(): string {
  if (!props.todo.dueDate) return ''
  
  if (isOverdue(props.todo.dueDate)) return 'due-date--overdue'
  if (isToday(props.todo.dueDate)) return 'due-date--today'
  return 'due-date--future'
}

async function startEdit() {
  editData.text = props.todo.text
  editData.priority = props.todo.priority
  editData.dueDate = props.todo.dueDate || ''
  isEditing.value = true
  
  await nextTick()
  editInput.value?.focus()
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  if (!editData.text.trim()) {
    alert('Todo text cannot be empty')
    return
  }

  const updates: Partial<TodoItem> = {
    text: editData.text.trim(),
    priority: editData.priority,
    dueDate: editData.dueDate || undefined
  }

  emit('update', props.todo.id!, updates)
  isEditing.value = false
}
</script>

<style scoped>
.todo-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: start;
  padding: 1rem;
  background: var(--db-color-bg-basic-level-1);
  border: 1px solid var(--db-color-border-basic-level-1);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.todo-item:hover {
  border-color: var(--db-color-border-basic-level-2);
  box-shadow: 0 2px 4px var(--db-color-shadow-basic-level-1);
}

.todo-item--completed {
  opacity: 0.7;
}

@media (max-width: 767px) {
  .todo-item {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
  }
  
  .todo-actions {
    grid-column: 1 / -1;
    justify-self: end;
  }
}

.todo-checkbox {
  padding-top: 0.25rem;
}

.todo-content {
  min-width: 0;
}

.todo-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-text {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--db-color-text-primary);
  word-break: break-word;
}

.todo-text--completed {
  text-decoration: line-through;
  color: var(--db-color-text-secondary);
}

.todo-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.todo-due-date {
  font-size: 0.875rem;
  font-weight: 500;
}

.due-date--overdue {
  color: var(--db-color-text-danger);
  font-weight: 600;
}

.due-date--today {
  color: var(--db-color-text-warning);
  font-weight: 600;
}

.due-date--future {
  color: var(--db-color-text-secondary);
}

.todo-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.todo-edit {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr auto auto;
}

@media (max-width: 767px) {
  .todo-edit {
    grid-template-columns: 1fr;
  }
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
  align-items: start;
}
</style>
