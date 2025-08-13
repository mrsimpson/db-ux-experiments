# Design Document: Personal Todo App

## Architecture Reference
See [Architecture Document](./architecture.md) for high-level system context and architecture decisions.

## Technology Stack
- **Frontend Framework:** Vue 3 with Composition API - Modern reactivity and TypeScript integration
- **UI Components:** db-ux component library - Deutsche Bahn design system showcase
- **Build Tool:** Vite - Fast development and modern ES modules
- **Language:** TypeScript - Type safety and better developer experience
- **Storage:** IndexedDB - Complete offline functionality
- **Testing:** Vitest + Vue Test Utils - Vite-native testing with Vue 3 support

## Implementation Strategy

### Phase 1: Foundation Setup
**Goal:** Establish development environment and core infrastructure

**Tasks:**
1. **Project Initialization**
   - Initialize Vite + Vue 3 + TypeScript project
   - Install and configure db-ux dependencies
   - Set up development environment with hot reload

2. **Core Infrastructure**
   - Implement IndexedDB service layer
   - Create Todo data model and TypeScript interfaces
   - Set up reactive store using Vue's reactivity system

3. **Basic Application Shell**
   - Create main App.vue with db-ux layout components
   - Implement basic routing structure (if needed)
   - Set up global styles and db-ux theme integration

### Phase 2: Core Components
**Goal:** Build main UI components using db-ux patterns

**Tasks:**
1. **TodoForm Component**
   - Input field for todo text (db-ux Input)
   - Date picker for due dates (db-ux Input type="date")
   - Tag input system (db-ux Input with tag parsing)
   - Submit/Cancel buttons (db-ux Button)

2. **TodoList Component**
   - Display todos in db-ux Card components
   - Implement completion toggle (db-ux Checkbox)
   - Show due dates and tags (db-ux Tag components)
   - Edit/Delete actions (db-ux Button)

3. **TagFilter Component**
   - Display available tags (db-ux Tag components)
   - Filter selection interface (db-ux Button/Toggle)
   - Clear filters functionality

### Phase 3: Data Integration
**Goal:** Connect UI components to IndexedDB storage

**Tasks:**
1. **Store Integration**
   - Connect TodoForm to store for creation
   - Connect TodoList to store for display and updates
   - Implement reactive filtering in TagFilter

2. **Data Persistence**
   - Ensure all CRUD operations persist to IndexedDB
   - Implement data loading on app initialization
   - Handle offline data consistency

### Phase 4: Polish and Testing
**Goal:** Complete the technical showcase with testing and refinements

**Tasks:**
1. **Testing Implementation**
   - Unit tests for store and IndexedDB service
   - Component tests for db-ux integration
   - Integration tests for complete workflows

2. **UI Polish**
   - Responsive design using db-ux layout components
   - Accessibility validation
   - Visual consistency with db-ux design system

## Detailed Component Design

### Data Model
```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TodoStore {
  todos: Ref<Todo[]>;
  filteredTodos: ComputedRef<Todo[]>;
  selectedTags: Ref<string[]>;
  availableTags: ComputedRef<string[]>;
}
```

### IndexedDB Schema
```typescript
// Database: TodoApp, Version: 1
// Object Store: todos
// Key Path: id
// Indexes: 
//   - completed: boolean
//   - tags: string[] (multiEntry: true)
//   - dueDate: Date
```

### Component Interfaces

#### TodoForm.vue
```typescript
interface TodoFormProps {
  editTodo?: Todo;
}

interface TodoFormEmits {
  submit: (todo: Partial<Todo>) => void;
  cancel: () => void;
}
```

#### TodoList.vue
```typescript
interface TodoListProps {
  todos: Todo[];
}

interface TodoListEmits {
  toggle: (id: string) => void;
  edit: (todo: Todo) => void;
  delete: (id: string) => void;
}
```

#### TagFilter.vue
```typescript
interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
}

interface TagFilterEmits {
  updateFilter: (tags: string[]) => void;
  clearFilter: () => void;
}
```

## Implementation Details

### IndexedDB Service
```typescript
class IndexedDBService {
  private db: IDBDatabase | null = null;
  
  async init(): Promise<void>
  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo>
  async getTodos(): Promise<Todo[]>
  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo>
  async deleteTodo(id: string): Promise<void>
  async getTodosByTag(tag: string): Promise<Todo[]>
}
```

### Reactive Store
```typescript
// composables/useTodoStore.ts
export function useTodoStore() {
  const todos = ref<Todo[]>([]);
  const selectedTags = ref<string[]>([]);
  
  const filteredTodos = computed(() => {
    if (selectedTags.value.length === 0) return todos.value;
    return todos.value.filter(todo => 
      selectedTags.value.some(tag => todo.tags.includes(tag))
    );
  });
  
  const availableTags = computed(() => {
    const tagSet = new Set<string>();
    todos.value.forEach(todo => todo.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  });
  
  return {
    todos: readonly(todos),
    filteredTodos,
    selectedTags,
    availableTags,
    // ... CRUD methods
  };
}
```

### db-ux Component Usage

#### Layout Structure
```vue
<template>
  <db-section class="todo-app">
    <db-stack gap="large">
      <db-card>
        <TodoForm @submit="handleSubmit" />
      </db-card>
      
      <db-card>
        <TagFilter 
          :available-tags="availableTags"
          :selected-tags="selectedTags"
          @update-filter="updateFilter"
        />
      </db-card>
      
      <db-stack gap="medium">
        <TodoItem 
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo="todo"
          @toggle="toggleTodo"
          @edit="editTodo"
          @delete="deleteTodo"
        />
      </db-stack>
    </db-stack>
  </db-section>
</template>
```

#### Form Implementation
```vue
<template>
  <db-stack gap="medium">
    <db-input
      v-model="todoText"
      label="Todo"
      placeholder="Enter your todo..."
      required
    />
    
    <db-input
      v-model="dueDate"
      type="date"
      label="Due Date"
      optional
    />
    
    <db-input
      v-model="tagInput"
      label="Tags"
      placeholder="Enter tags separated by commas..."
      @keyup.enter="addTag"
    />
    
    <db-stack direction="horizontal" gap="small">
      <db-tag
        v-for="tag in currentTags"
        :key="tag"
        removable
        @remove="removeTag(tag)"
      >
        {{ tag }}
      </db-tag>
    </db-stack>
    
    <db-stack direction="horizontal" gap="small">
      <db-button variant="primary" @click="submit">
        {{ editMode ? 'Update' : 'Add' }} Todo
      </db-button>
      <db-button variant="secondary" @click="cancel">
        Cancel
      </db-button>
    </db-stack>
  </db-stack>
</template>
```

## Testing Strategy

### Unit Tests
```typescript
// services/__tests__/IndexedDBService.test.ts
describe('IndexedDBService', () => {
  test('creates todo with generated id and timestamps');
  test('retrieves all todos from database');
  test('updates existing todo');
  test('deletes todo by id');
  test('filters todos by tags');
});

// composables/__tests__/useTodoStore.test.ts
describe('useTodoStore', () => {
  test('filters todos by selected tags');
  test('computes available tags from all todos');
  test('reactive updates when todos change');
});
```

### Component Tests
```typescript
// components/__tests__/TodoForm.test.ts
describe('TodoForm', () => {
  test('renders db-ux input components');
  test('emits submit event with form data');
  test('validates required fields');
  test('handles tag input and parsing');
});

// components/__tests__/TodoList.test.ts
describe('TodoList', () => {
  test('renders todos in db-ux cards');
  test('toggles completion status');
  test('emits edit and delete events');
  test('displays tags using db-ux tag components');
});
```

## Error Handling

### IndexedDB Error Handling
```typescript
try {
  await indexedDBService.createTodo(todoData);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Handle storage quota exceeded
    showNotification('Storage quota exceeded', 'error');
  } else {
    // Handle other database errors
    showNotification('Failed to save todo', 'error');
  }
}
```

### Form Validation
```typescript
const validateTodo = (todo: Partial<Todo>): string[] => {
  const errors: string[] = [];
  
  if (!todo.text?.trim()) {
    errors.push('Todo text is required');
  }
  
  if (todo.text && todo.text.length > 500) {
    errors.push('Todo text must be less than 500 characters');
  }
  
  if (todo.dueDate && todo.dueDate < new Date()) {
    errors.push('Due date cannot be in the past');
  }
  
  return errors;
};
```

## Performance Considerations

### IndexedDB Optimization
- Use indexes for filtering by completion status and tags
- Implement pagination for large todo lists (future enhancement)
- Cache frequently accessed data in memory

### Vue Performance
- Use `v-memo` for todo list items to prevent unnecessary re-renders
- Implement virtual scrolling for large lists (if needed)
- Optimize computed properties with proper dependencies

### Bundle Size
- Tree-shake unused db-ux components
- Use dynamic imports for non-critical components
- Optimize Vite build configuration for production

## Security Considerations

### Input Sanitization
```typescript
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

### Data Validation
- Validate all user inputs before storing
- Implement proper TypeScript interfaces for type safety
- Sanitize data when displaying to prevent XSS

## Deployment Strategy

### Development
```bash
npm run dev  # Vite dev server with hot reload
npm run test # Run test suite
npm run lint # TypeScript and ESLint checks
```

### Production Build
```bash
npm run build    # Generate optimized static files
npm run preview  # Preview production build locally
```

### Static Hosting
- Deploy to any static hosting service (Netlify, Vercel, GitHub Pages)
- No server-side requirements
- All functionality works offline after initial load

## Implementation Milestones

### Milestone 1: Foundation (Week 1)
- ✅ Project setup with Vite + Vue 3 + TypeScript
- ✅ db-ux integration and basic styling
- ✅ IndexedDB service implementation
- ✅ Basic data models and interfaces

### Milestone 2: Core Features (Week 2)
- ✅ TodoForm component with db-ux inputs
- ✅ TodoList component with db-ux cards
- ✅ Basic CRUD operations working
- ✅ Tag system implementation

### Milestone 3: Advanced Features (Week 3)
- ✅ Tag filtering functionality
- ✅ Due date handling
- ✅ Completion status management
- ✅ Data persistence validation

### Milestone 4: Polish & Testing (Week 4)
- ✅ Comprehensive test suite
- ✅ UI polish and responsive design
- ✅ Accessibility validation
- ✅ Performance optimization

## Success Criteria

### Functional Requirements
- [x] Create, read, update, delete todos
- [x] Add due dates and tags to todos
- [x] Filter todos by tags
- [x] Mark todos as complete/incomplete
- [x] Persist data offline using IndexedDB

### Technical Showcase Requirements
- [x] Demonstrate db-ux component usage
- [x] Show Vue 3 Composition API patterns
- [x] Implement TypeScript throughout
- [x] Create offline-first architecture
- [x] Include testing examples

### Quality Requirements
- [x] Responsive design using db-ux layout
- [x] Accessibility compliance
- [x] Fast performance for local operations
- [x] Clean, maintainable code structure
