<template>
  <DBCard>
    <DBStack gap="medium">
      <div class="filter-header">
        <h3>Filter by Tags</h3>
        <DBButton
          v-if="selectedTags.length > 0"
          variant="ghost"
          size="small"
          @click="$emit('clear-filter')"
        >
          Clear All
        </DBButton>
      </div>
      
      <div v-if="availableTags.length === 0" class="no-tags">
        <p>No tags available. Add some tags to your todos to filter them!</p>
      </div>
      
      <div v-else class="tag-filters">
        <DBStack direction="horizontal" gap="small" wrap>
          <DBTag
            v-for="tag in availableTags"
            :key="tag"
            :variant="isTagSelected(tag) ? 'brand' : 'neutral'"
            clickable
            @click="toggleTag(tag)"
            :aria-pressed="isTagSelected(tag)"
          >
            {{ tag }}
            <span v-if="isTagSelected(tag)" class="selected-indicator">✓</span>
          </DBTag>
        </DBStack>
      </div>
      
      <div v-if="selectedTags.length > 0" class="selected-info">
        <p>
          <strong>{{ selectedTags.length }}</strong> tag{{ selectedTags.length === 1 ? '' : 's' }} selected:
          <span class="selected-tags">{{ selectedTags.join(', ') }}</span>
        </p>
      </div>
    </DBStack>
  </DBCard>
</template>

<script setup lang="ts">
import { DBCard, DBStack, DBButton, DBTag } from '@db-ux/v-core-components'

// Props
interface Props {
  availableTags: string[]
  selectedTags: string[]
}

const props = defineProps<Props>()

// Emits
interface Emits {
  'update-filter': [tags: string[]]
  'clear-filter': []
}

const emit = defineEmits<Emits>()

// Methods
const isTagSelected = (tag: string): boolean => {
  return props.selectedTags.includes(tag)
}

const toggleTag = (tag: string) => {
  const newSelectedTags = [...props.selectedTags]
  const index = newSelectedTags.indexOf(tag)
  
  if (index !== -1) {
    // Remove tag
    newSelectedTags.splice(index, 1)
  } else {
    // Add tag
    newSelectedTags.push(tag)
  }
  
  emit('update-filter', newSelectedTags)
}
</script>

<style scoped>
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-tags {
  text-align: center;
  color: var(--db-color-neutral-text-weak);
  padding: 1rem;
}

.tag-filters {
  min-height: 2rem;
}

.selected-indicator {
  margin-left: 0.25rem;
  font-weight: bold;
}

.selected-info {
  padding: 0.75rem;
  background-color: var(--db-color-neutral-bg-level-2);
  border-radius: var(--db-border-radius-sm);
  border: 1px solid var(--db-color-neutral-border-weak);
}

.selected-tags {
  font-style: italic;
  color: var(--db-color-neutral-text-weak);
}

h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

p {
  margin: 0;
}
</style>
