<template>
  <div class="tag-manager">
    <div class="selected-tags" v-if="selectedTagObjects.length > 0">
      <DBTag
        v-for="tag in selectedTagObjects"
        :key="tag.id"
        class="selected-tag"
        :style="{ '--db-tag-bg-color': tag.color }"
      >
        {{ tag.name }}
        <button
          @click="removeTag(tag.id!)"
          class="remove-tag-button"
          type="button"
          title="Remove tag"
        >
          ×
        </button>
      </DBTag>
    </div>

    <div class="tag-controls">
      <DBSelect
        v-model:value="selectedTagId"
        @change="addExistingTag"
        class="tag-select"
      >
        <option value="">Select a tag...</option>
        <option
          v-for="tag in availableTags"
          :key="tag.id"
          :value="tag.id"
        >
          {{ tag.name }}
        </option>
      </DBSelect>

      <DBButton
        @click="showNewTagForm = !showNewTagForm"
        type="button"
        variant="secondary"
      >
        {{ showNewTagForm ? 'Cancel' : 'New Tag' }}
      </DBButton>
    </div>

    <div v-if="showNewTagForm" class="new-tag-form">
      <div class="form-row">
        <DBInput
          v-model:value="newTag.name"
          placeholder="Tag name"
          maxlength="50"
          @keyup.enter="createNewTag"
        />
        <input
          v-model="newTag.color"
          type="color"
          class="color-input"
          title="Tag color"
        />
        <DBButton
          @click="createNewTag"
          type="button"
          variant="primary"
          :disabled="!newTag.name.trim() || isCreating"
        >
          {{ isCreating ? 'Creating...' : 'Create' }}
        </DBButton>
      </div>
      <p v-if="newTagError" class="error-text">{{ newTagError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { DBTag, DBSelect, DBButton, DBInput } from '@db-ux/v-core-components'
import { useTodoStore } from '@/stores/todoStore'
import { validateTagForm } from '@/utils/validation'
import type { Tag } from '@/types/todo'

interface Props {
  modelValue: number[]
}

interface Emits {
  (e: 'update:modelValue', value: number[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const todoStore = useTodoStore()
const selectedTagId = ref('')
const showNewTagForm = ref(false)
const isCreating = ref(false)
const newTagError = ref('')

const newTag = reactive({
  name: '',
  color: '#1976d2'
})

const selectedTagObjects = computed(() => {
  return todoStore.tags.filter(tag => props.modelValue.includes(tag.id!))
})

const availableTags = computed(() => {
  return todoStore.tags.filter(tag => !props.modelValue.includes(tag.id!))
})

// Reset form when hiding
watch(showNewTagForm, (show) => {
  if (!show) {
    newTag.name = ''
    newTag.color = '#1976d2'
    newTagError.value = ''
  }
})

function addExistingTag() {
  if (!selectedTagId.value) return
  
  const tagId = parseInt(selectedTagId.value)
  if (!props.modelValue.includes(tagId)) {
    emit('update:modelValue', [...props.modelValue, tagId])
  }
  
  selectedTagId.value = ''
}

function removeTag(tagId: number) {
  emit('update:modelValue', props.modelValue.filter(id => id !== tagId))
}

async function createNewTag() {
  newTagError.value = ''
  
  // Validate form
  const validation = validateTagForm({
    name: newTag.name.trim(),
    color: newTag.color
  })

  if (!validation.isValid) {
    newTagError.value = validation.error || 'Invalid tag data'
    return
  }

  // Check for duplicate names
  const existingTag = todoStore.tags.find(
    tag => tag.name.toLowerCase() === newTag.name.trim().toLowerCase()
  )
  
  if (existingTag) {
    newTagError.value = 'A tag with this name already exists'
    return
  }

  try {
    isCreating.value = true
    
    await todoStore.addTag({
      name: newTag.name.trim(),
      color: newTag.color
    })

    // Find the newly created tag and add it to selection
    const createdTag = todoStore.tags.find(
      tag => tag.name.toLowerCase() === newTag.name.trim().toLowerCase()
    )
    
    if (createdTag && createdTag.id) {
      emit('update:modelValue', [...props.modelValue, createdTag.id])
    }

    // Reset form
    newTag.name = ''
    newTag.color = '#1976d2'
    showNewTagForm.value = false
  } catch (error) {
    newTagError.value = error instanceof Error ? error.message : 'Failed to create tag'
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.tag-manager {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selected-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-tag-button {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  margin: 0;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.remove-tag-button:hover {
  opacity: 1;
}

.tag-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.tag-select {
  flex: 1;
}

.new-tag-form {
  padding: 1rem;
  background: var(--db-color-bg-basic-level-2);
  border-radius: 0.25rem;
  border: 1px solid var(--db-color-border-basic-level-1);
}

.form-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

@media (max-width: 767px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
}

.color-input {
  width: 3rem;
  height: 2.5rem;
  border: 1px solid var(--db-color-border-basic-level-1);
  border-radius: 0.25rem;
  cursor: pointer;
  background: none;
}

.error-text {
  color: var(--db-color-text-danger);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>
