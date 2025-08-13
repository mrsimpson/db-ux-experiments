<template>
  <DBCard>
    <form @submit.prevent="handleSubmit">
      <DBStack gap="medium">
        <h2>{{ editMode ? 'Edit Todo' : 'Add New Todo' }}</h2>
        
        <!-- Todo Text Input -->
        <DBInput
          v-model:value="todoText"
          label="Todo"
          placeholder="Enter your todo..."
          required
          :invalid="!!textError"
          :invalidMessage="textError"
        />
        
        <!-- Due Date Input -->
        <DBInput
          v-model:value="dueDate"
          type="date"
          label="Due Date"
          placeholder="Select due date..."
        />
        
        <!-- Tag Input -->
        <DBInput
          v-model:value="tagInput"
          label="Tags"
          placeholder="Enter tags separated by commas..."
          @keyup.enter="addTagFromInput"
          :message="tagInput ? 'Press Enter to add tag' : ''"
        />
        
        <!-- Current Tags Display -->
        <div v-if="currentTags.length > 0">
          <label class="db-label">Current Tags:</label>
          <DBStack direction="horizontal" gap="small" class="tag-list">
            <DBTag
              v-for="tag in currentTags"
              :key="tag"
              removable
              @remove="removeTag(tag)"
            >
              {{ tag }}
            </DBTag>
          </DBStack>
        </div>
        
        <!-- Action Buttons -->
        <DBStack direction="horizontal" gap="small">
          <DBButton 
            variant="brand" 
            type="submit"
            :disabled="!isFormValid"
          >
            {{ editMode ? 'Update' : 'Add' }} Todo
          </DBButton>
          <DBButton 
            v-if="editMode"
            variant="ghost" 
            type="button"
            @click="handleCancel"
          >
            Cancel
          </DBButton>
        </DBStack>
      </DBStack>
    </form>
  </DBCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DBCard, DBStack, DBInput, DBButton, DBTag } from '@db-ux/v-core-components'
import type { CreateTodoData, Todo } from '@/types/Todo'

// Props
interface Props {
  editTodo?: Todo
}

const props = withDefaults(defineProps<Props>(), {
  editTodo: undefined
})

// Emits
interface Emits {
  submit: [data: CreateTodoData]
  cancel: []
}

const emit = defineEmits<Emits>()

// Form state
const todoText = ref('')
const dueDate = ref('')
const tagInput = ref('')
const currentTags = ref<string[]>([])

// Computed properties
const editMode = computed(() => !!props.editTodo)

const textError = computed(() => {
  if (!todoText.value.trim()) return ''
  if (todoText.value.length > 500) return 'Todo text must be less than 500 characters'
  return ''
})

const isFormValid = computed(() => {
  return todoText.value.trim().length > 0 && !textError.value
})

// Methods
const addTagFromInput = () => {
  const tag = tagInput.value.trim()
  if (tag && !currentTags.value.includes(tag)) {
    currentTags.value.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tagToRemove: string) => {
  const index = currentTags.value.indexOf(tagToRemove)
  if (index !== -1) {
    currentTags.value.splice(index, 1)
  }
}

const resetForm = () => {
  todoText.value = ''
  dueDate.value = ''
  tagInput.value = ''
  currentTags.value = []
}

const handleSubmit = () => {
  if (!isFormValid.value) return

  const formData: CreateTodoData = {
    text: todoText.value.trim(),
    dueDate: dueDate.value ? new Date(dueDate.value) : undefined,
    tags: [...currentTags.value]
  }

  emit('submit', formData)
  
  if (!editMode.value) {
    resetForm()
  }
}

const handleCancel = () => {
  resetForm()
  emit('cancel')
}

// Watch for edit todo changes
watch(() => props.editTodo, (newEditTodo) => {
  if (newEditTodo) {
    todoText.value = newEditTodo.text
    dueDate.value = newEditTodo.dueDate ? newEditTodo.dueDate.toISOString().split('T')[0] : ''
    currentTags.value = [...newEditTodo.tags]
    tagInput.value = ''
  } else {
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
.tag-list {
  margin-top: 0.5rem;
}

.db-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--db-color-neutral-text-strong);
}

h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}
</style>
