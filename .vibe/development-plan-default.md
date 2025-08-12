# Development Plan: dbui-llm-experiment (default branch)

*Generated on 2025-08-11 by Vibe Feature MCP*
*Workflow: [epcc](https://mrsimpson.github.io/responsible-vibe-mcp/workflows/epcc)*

## Goal
Build a comprehensive todo app using Vue.js with DB UI components for styling, using IndexedDB with a relational model (items, tags) for data persistence (no backend required).

**Features:**
- Add new todos
- Mark todos as complete/incomplete  
- Delete todos
- Edit existing todos
- Filter todos (all/active/completed)
- Clear completed todos
- Priority levels
- Due dates
- Categories/tags

**Data Model:**
- Items table: id, text, completed, priority, dueDate, createdAt, updatedAt
- Tags table: id, name, color
- ItemTags junction table: itemId, tagId

**UI Layout:**
- Single page with all todos in one list (no groupings)

## Explore
### Tasks
- [x] Explored DB UI components documentation and architecture
- [x] Identified available components: DBButton, DBInput, DBCheckbox, DBSelect
- [x] Researched DB UI design system structure (uses Mitosis for multi-framework support)
- [x] Confirmed Vue.js support in DB UI components
- [x] Defined comprehensive todo app feature requirements and scope
- [x] Decided on IndexedDB with Dexie.js for relational data handling
- [x] Confirmed Vue 3 + Vite + TypeScript + Pinia tech stack
- [x] Decided on HTML5 date input and flexible tag system
- [x] Researched DB UI Vue package installation: `@db-ux/vue-core-components`
- [x] Identified required packages: components, foundations, db-theme
- [x] Designed Dexie.js schema for todo app data model (items, tags, itemTags)
- [x] Outlined Vue 3 + Pinia integration patterns for IndexedDB
- [x] Exploration phase complete - ready for planning

### Completed
- [x] Created development plan file

## Plan

### Phase Entrance Criteria:
- [x] The requirements have been thoroughly defined
- [x] DB UI components documentation has been explored
- [x] Vue.js project structure and setup approach has been researched
- [x] IndexedDB implementation approach has been investigated
- [x] Technical alternatives have been evaluated and documented
- [x] It's clear what's in scope and out of scope

### Implementation Strategy

**1. Project Setup & Foundation**
- Initialize Vue 3 + Vite + TypeScript project
- Install and configure DB UI components and dependencies
- Set up Pinia store structure
- Configure Dexie.js database with schema
- Set up basic project structure and routing

**2. Database Layer**
- Implement Dexie.js database class with TodoItem, Tag, ItemTag tables
- Create database service layer with CRUD operations
- Implement data validation and error handling
- Add database initialization and migration logic

**3. State Management (Pinia)**
- Create todo store with state, getters, and actions
- Implement IndexedDB integration in store actions
- Add computed properties for filtered todos
- Handle loading states and error management

**4. Core Components**
- TodoItem component (display, edit, delete, toggle complete)
- TodoForm component (add new todos with all fields)
- TagManager component (create, select, manage tags)
- FilterControls component (all/active/completed filters)

**5. Main Application**
- App.vue with main layout using DB UI components
- TodoList component to render filtered todos
- Integration of all components with proper data flow
- Responsive design with DB UI styling

**6. Advanced Features**
- Priority level selection and display
- Due date handling with HTML5 date input
- Tag creation and assignment workflow
- Bulk operations (clear completed, etc.)

### Tasks
- [x] Create detailed project structure plan
- [x] Design component architecture and data flow
- [x] Plan database service layer interface
- [x] Design Pinia store structure and actions
- [x] Plan UI/UX flow and component interactions
- [x] Define TypeScript interfaces and types
- [x] Plan error handling and validation strategy
- [x] Design responsive layout with DB UI components
- [x] Plan accessibility considerations
- [x] Create development and testing strategy

### Completed
- [x] **Project Structure Plan:**
  ```
  src/
  ├── main.ts                 # App entry point
  ├── App.vue                 # Root component
  ├── components/             # Vue components
  │   ├── TodoItem.vue        # Individual todo item
  │   ├── TodoForm.vue        # Add/edit todo form
  │   ├── TodoList.vue        # List of todos
  │   ├── TagManager.vue      # Tag creation/selection
  │   ├── FilterControls.vue  # Filter buttons
  │   └── PrioritySelect.vue  # Priority selection
  ├── stores/                 # Pinia stores
  │   ├── index.ts           # Store setup
  │   └── todoStore.ts       # Todo state management
  ├── services/              # Business logic
  │   ├── database.ts        # Dexie.js setup
  │   └── todoService.ts     # Todo CRUD operations
  ├── types/                 # TypeScript definitions
  │   ├── todo.ts           # Todo-related types
  │   └── database.ts       # Database types
  ├── utils/                 # Helper functions
  │   ├── dateUtils.ts      # Date formatting
  │   └── validation.ts     # Input validation
  └── assets/               # Static assets
      └── styles/           # Custom styles
  ```

- [x] **Component Architecture & Data Flow:**
  ```
  App.vue (Root)
  ├── TodoForm.vue (Add new todos)
  │   ├── DBInput (text input)
  │   ├── PrioritySelect.vue (DBSelect)
  │   ├── input[type="date"] (due date)
  │   ├── TagManager.vue (tag selection)
  │   └── DBButton (submit)
  ├── FilterControls.vue (Filter todos)
  │   └── DBButton (all/active/completed)
  └── TodoList.vue (Display todos)
      └── TodoItem.vue (Individual todo)
          ├── DBCheckbox (complete toggle)
          ├── span (todo text)
          ├── span (priority badge)
          ├── span (due date)
          ├── TagDisplay (tags)
          ├── DBButton (edit)
          └── DBButton (delete)

- [x] **Database Service Layer Interface:**
  ```typescript
  // TodoService Interface
  interface TodoService {
    // Todo CRUD operations
    getAllTodos(): Promise<TodoItem[]>
    getTodoById(id: number): Promise<TodoItem | undefined>
    createTodo(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<number>
    updateTodo(id: number, updates: Partial<TodoItem>): Promise<void>
    deleteTodo(id: number): Promise<void>
    toggleTodoComplete(id: number): Promise<void>
    
    // Tag operations
    getAllTags(): Promise<Tag[]>
    createTag(tag: Omit<Tag, 'id' | 'createdAt'>): Promise<number>
    deleteTag(id: number): Promise<void>
    
    // Tag-Todo relationships
    addTagToTodo(todoId: number, tagId: number): Promise<void>
    removeTagFromTodo(todoId: number, tagId: number): Promise<void>
    getTodoTags(todoId: number): Promise<Tag[]>
    getTagTodos(tagId: number): Promise<TodoItem[]>
    
    // Bulk operations
    clearCompletedTodos(): Promise<void>
    deleteAllTodos(): Promise<void>
  }

  // Database initialization
  interface DatabaseService {
    initialize(): Promise<void>
    reset(): Promise<void>
    export(): Promise<string>
    import(data: string): Promise<void>
- [x] **Pinia Store Structure & Actions:**
  ```typescript
  // Todo Store State
  interface TodoState {
    todos: TodoItem[]
    tags: Tag[]
    filter: 'all' | 'active' | 'completed'
    selectedTags: number[]
    loading: boolean
    error: string | null
  }

  // Store Getters
  const getters = {
    filteredTodos: (state) => {
      let filtered = state.todos
      
      // Filter by completion status
      if (state.filter === 'active') filtered = filtered.filter(t => !t.completed)
      if (state.filter === 'completed') filtered = filtered.filter(t => t.completed)
      
      // Filter by selected tags
      if (state.selectedTags.length > 0) {
        filtered = filtered.filter(todo => 
          state.selectedTags.some(tagId => 
            todo.tags?.some(tag => tag.id === tagId)
          )
        )
      }
      
      return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    },
    
    todoStats: (state) => ({
      total: state.todos.length,
      active: state.todos.filter(t => !t.completed).length,
      completed: state.todos.filter(t => t.completed).length
    })
  }

  // Store Actions
  const actions = {
    // Initialize
    async initialize() { /* Load todos and tags from DB */ },
    
    // Todo actions
    async addTodo(todoData) { /* Create todo in DB and update state */ },
    async updateTodo(id, updates) { /* Update todo in DB and state */ },
    async deleteTodo(id) { /* Delete todo from DB and state */ },
    async toggleComplete(id) { /* Toggle completion status */ },
    
    // Tag actions
    async addTag(tagData) { /* Create tag in DB and update state */ },
    async deleteTag(id) { /* Delete tag and remove from todos */ },
    
    // Filter actions
    setFilter(filter) { /* Update filter state */ },
    setSelectedTags(tagIds) { /* Update tag filter */ },
    
    // Bulk actions
    async clearCompleted() { /* Remove all completed todos */ }
- [x] **UI/UX Flow & Component Interactions:**
  ```
  1. App Load → Initialize Pinia store → Load todos/tags from IndexedDB
  2. Add Todo Flow:
     - User fills TodoForm (text, priority, due date, tags)
     - Form validation → Submit → Store action → DB save → UI update
  3. Edit Todo Flow:
     - Click edit → TodoItem becomes editable → Save/Cancel actions
  4. Complete Todo Flow:
     - Click checkbox → Toggle action → DB update → UI update
  5. Delete Todo Flow:
     - Click delete → Confirmation → Delete action → DB remove → UI update
  6. Filter Flow:
     - Click filter button → Update store filter → Computed todos update
  7. Tag Management Flow:
     - Create new tag → Add to available tags → Assign to todo
     - Select existing tag → Multi-select interface
  ```

- [x] **TypeScript Interfaces & Types:**
  ```typescript
  // Core Types
  type Priority = 'low' | 'medium' | 'high' | 'critical'
  type FilterType = 'all' | 'active' | 'completed'

  // Database Entities
  interface TodoItem {
    id?: number
    text: string
    completed: boolean
    priority: Priority
    dueDate?: string
    createdAt: Date
    updatedAt: Date
  }

  interface Tag {
    id?: number
    name: string
    color: string
    createdAt: Date
  }

  interface ItemTag {
    id?: number
    itemId: number
    tagId: number
  }

  // Form Types
  interface TodoFormData {
    text: string
    priority: Priority
    dueDate?: string
    tagIds: number[]
  }

  interface TagFormData {
    name: string
    color: string
  }

  // Component Props
  interface TodoItemProps {
    todo: TodoItem
    tags: Tag[]
    onUpdate: (id: number, updates: Partial<TodoItem>) => void
    onDelete: (id: number) => void
    onToggle: (id: number) => void
  }

  // API Response Types
  interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
- [x] **Error Handling & Validation Strategy:**
  ```typescript
  // Input Validation
  - Todo text: Required, min 1 char, max 500 chars
  - Due date: Optional, must be future date or today
  - Tag name: Required, min 1 char, max 50 chars, unique
  - Priority: Must be valid enum value

  // Error Handling Layers
  1. Form Validation (Client-side)
     - Real-time validation with DB UI error states
     - Form submission prevention on invalid data
  
  2. Database Service (Service layer)
     - Try-catch blocks around all DB operations
     - Specific error types for different failures
     - Graceful degradation for DB connection issues
  
  3. Store Actions (State management)
     - Loading states during async operations
     - Error state management in store
     - User-friendly error messages
  
  4. Component Level (UI feedback)
     - Loading spinners during operations
     - Toast notifications for success/error
     - Fallback UI for error states
  ```

- [x] **Responsive Layout with DB UI Components:**
  ```scss
  // Mobile-first responsive design
  .todo-app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    
    @media (min-width: 768px) {
      padding: 2rem;
    }
  }

  .todo-form {
    display: grid;
    gap: 1rem;
    
    @media (min-width: 768px) {
      grid-template-columns: 1fr auto auto auto;
      align-items: end;
    }
  }

  .todo-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .todo-item {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    
    @media (max-width: 767px) {
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
    }
  }
  ```

- [x] **Accessibility Considerations:**
  ```
  - Semantic HTML structure with proper headings
  - ARIA labels for all interactive elements
  - Keyboard navigation support (Tab, Enter, Space, Escape)
  - Screen reader announcements for state changes
  - High contrast colors following DB UI guidelines
  - Focus management for modal dialogs
  - Skip links for keyboard users
  - Proper form labels and error associations
  - Live regions for dynamic content updates
  - Reduced motion support for animations
  ```

- [x] **Development & Testing Strategy:**
  ```
  Development Phases:
  1. Project setup and basic structure
  2. Database layer implementation
  3. Core components development
  4. State management integration
  5. UI polish and responsive design
  6. Testing and accessibility audit

  Testing Approach:
  - Unit tests for utility functions and services
  - Component testing with Vue Test Utils
  - Integration tests for store actions
  - E2E tests for critical user flows
  - Accessibility testing with axe-core
  - Manual testing across devices/browsers

  Development Tools:
  - Vite dev server with HMR
  - Vue DevTools for debugging
  - TypeScript for type safety
  - ESLint + Prettier for code quality
  - Vitest for unit testing
  ```

## Code

### Phase Entrance Criteria:
- [x] Detailed implementation plan has been created and approved
- [x] Project structure and architecture have been defined
- [x] DB UI components to be used have been identified
- [x] IndexedDB data model has been designed
- [x] Implementation tasks have been broken down into manageable steps

### Tasks

**Phase 1: Project Setup & Foundation**
- [x] Initialize Vue 3 + Vite + TypeScript project
- [x] Install DB UI packages (@db-ux/v-core-components, @db-ux/core-foundations, @db-ux/core-components, @db-ux/db-theme)
- [x] Install additional dependencies (Pinia, Dexie.js)
- [x] Configure Vite for DB UI integration
- [x] Set up TypeScript configuration
- [x] Create basic project structure (folders, index files)
- [x] Set up Pinia store configuration
- [x] Configure DB UI theming and styles

**Phase 2: Database Layer**
- [x] Create TypeScript interfaces and types (src/types/)
- [x] Implement Dexie.js database class (src/services/database.ts)
- [x] Create TodoService with CRUD operations (src/services/todoService.ts)
- [x] Add database initialization and migration logic
- [x] Implement error handling for database operations
- [x] Add utility functions for date handling and validation

**Phase 3: State Management**
- [x] Create Pinia todo store (src/stores/todoStore.ts)
- [x] Implement store state, getters, and actions
- [x] Add IndexedDB integration in store actions
- [x] Implement computed properties for filtered todos
- [x] Add loading states and error management
- [x] Create store initialization logic

**Phase 4: Core Components**
- [x] Create TodoForm component with DB UI components
- [x] Create TodoItem component with edit/delete functionality
- [x] Create TodoList component to render filtered todos
- [x] Create FilterControls component with DB UI buttons
- [x] Create PrioritySelect component using DBSelect
- [x] Create TagManager component for tag creation/selection
- [x] Implement component event handling and props

**Phase 5: Main Application**
- [x] Create App.vue with main layout using DB UI
- [x] Integrate all components with proper data flow
- [x] Add responsive design with DB UI styling
- [x] Implement keyboard navigation and accessibility
- [x] Add loading states and error handling UI
- [x] Create toast notifications for user feedback

**Phase 6: Advanced Features & Polish**
- [ ] Implement bulk operations (clear completed)
- [ ] Add drag-and-drop for todo reordering (optional)
- [ ] Implement data export/import functionality
- [ ] Add keyboard shortcuts for power users
- [ ] Optimize performance for large todo lists
- [ ] Add animations and transitions
- [ ] Conduct accessibility audit and fixes
- [ ] Cross-browser testing and fixes

### Completed
*None yet*

## Commit

### Phase Entrance Criteria:
- [ ] Core todo app functionality has been implemented
- [ ] DB UI components are properly integrated and styled
- [ ] Local storage functionality is working correctly
- [ ] Basic testing has been completed
- [ ] Code quality meets standards

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Key Decisions
- **Framework**: Vue.js 3 with Composition API for the frontend framework
- **Build Tool**: Vite for fast development and building
- **TypeScript**: Yes, for better type safety and developer experience
- **State Management**: Pinia for managing todo application state
- **UI Components**: DB UI Design System components (DBButton, DBInput, DBCheckbox, DBSelect)
- **Data Storage**: IndexedDB with Dexie.js for relational model (items, tags, itemTags junction table)
- **Architecture**: DB UI uses Mitosis to generate native Vue components
- **Styling**: DB UI provides built-in styling following Deutsche Bahn design guidelines
- **Features**: Full-featured todo app with priorities, due dates, tags, and filtering
- **UI Layout**: Single page with unified todo list (no groupings)
- **Date Input**: Native HTML5 date input styled with DB UI classes
- **Tag System**: Create new tags on-the-fly + select from existing tags
- **Priority Levels**: Low, Medium, High, Critical
- **Database Schema**: TodoItem, Tag, ItemTag tables with proper relationships
- **Package Installation**: @db-ux/vue-core-components + foundations + db-theme

## Notes
- DB UI Design System uses Mitosis to generate components for Angular, React, and Vue
- Available components for todo app: DBButton, DBInput, DBCheckbox, DBSelect
- DB UI follows Deutsche Bahn design guidelines and accessibility standards
- Components are available as native Vue components, not web components
- **Package Installation**: 
  - Main package: `@db-ux/vue-core-components`
  - Foundations: `@db-ux/core-foundations` (CSS/SCSS styles)
  - Components: `@db-ux/core-components` (component styles)
  - Theme: `@db-ux/db-theme` (Deutsche Bahn branding)
- IndexedDB will use Dexie.js for easier relational data handling
- HTML5 date input will be styled with DB UI classes
- Tag functionality will be custom implementation using DB UI styling
- Project is currently empty - need to set up Vue.js project structure
- Need to explore examples at: https://github.com/db-ux-design-system/examples

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
