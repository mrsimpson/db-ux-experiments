<template>
  <form @submit.prevent="handleSubmit" class="todo-form">
    <div class="form-group">
      <DBInput
        id="todo-text"
        v-model:value="formData.text"
        label="Todo"
        placeholder="What needs to be done?"
        :invalid="!!errors.text"
        :invalid-message="errors.text"
        required
      />
    </div>

    <div class="form-group">
      <DBSelect
        id="todo-priority"
        v-model:value="formData.priority"
        label="Priority"
        :invalid="!!errors.priority"
        :invalid-message="errors.priority"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </DBSelect>
    </div>

    <div class="form-group">
      <DBInput
        id="todo-due-date"
        v-model:value="formData.dueDate"
        type="date"
        label="Due Date (Optional)"
        :invalid="!!errors.dueDate"
        :invalid-message="errors.dueDate"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Tags (Optional)</label>
      <TagManager v-model="formData.tagIds" />
    </div>

    <DBButton
      type="submit"
      variant="primary"
      :disabled="isSubmitting"
    >
      {{ isSubmitting ? 'Adding...' : 'Add Todo' }}
    </DBButton>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DBInput, DBSelect, DBButton } from '@db-ux/v-core-components'
import { useTodoStore } from '@/stores/todoStore'
import { validateTodoForm } from '@/utils/validation'
import type { Priority } from '@/types/todo'
import TagManager from './TagManager.vue'

const todoStore = useTodoStore()

const formData = reactive({
  text: '',
  priority: 'medium' as Priority,
  dueDate: '',
  tagIds: [] as number[]
})

const errors = reactive({
  text: '',
  priority: '',
  dueDate: ''
})

const isSubmitting = ref(false)

function clearErrors() {
  errors.text = ''
  errors.priority = ''
  errors.dueDate = ''
}

function resetForm() {
  formData.text = ''
  formData.priority = 'medium'
  formData.dueDate = ''
  formData.tagIds = []
}

async function handleSubmit() {
  clearErrors()
  
  // Validate form
  const validation = validateTodoForm({
    text: formData.text,
    priority: formData.priority,
    dueDate: formData.dueDate || undefined
  })

  if (!validation.isValid) {
    // Set specific error based on validation
    if (formData.text.trim().length === 0) {
      errors.text = validation.error || 'Todo text is required'
    } else if (formData.dueDate) {
      errors.dueDate = validation.error || 'Invalid due date'
    } else {
      errors.priority = validation.error || 'Invalid priority'
    }
    return
  }

  try {
    isSubmitting.value = true
    
    await todoStore.addTodo({
      text: formData.text.trim(),
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      tagIds: formData.tagIds
    })

    resetForm()
  } catch (error) {
    console.error('Failed to add todo:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.todo-form {
  background: var(--db-color-bg-basic-level-1);
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--db-color-border-basic-level-1);
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .todo-form {
    grid-template-columns: 1fr auto auto auto;
    align-items: end;
  }
  
  .todo-form .form-group:first-child {
    grid-column: 1;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--db-color-text-primary);
  font-size: 0.875rem;
}
</style>
