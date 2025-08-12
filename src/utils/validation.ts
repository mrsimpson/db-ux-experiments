import type { Priority } from '@/types/todo'

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate todo text
 */
export function validateTodoText(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'Todo text is required' }
  }
  
  if (text.trim().length > 500) {
    return { isValid: false, error: 'Todo text must be less than 500 characters' }
  }
  
  return { isValid: true }
}

/**
 * Validate due date
 */
export function validateDueDate(dateString?: string): ValidationResult {
  if (!dateString) {
    return { isValid: true } // Due date is optional
  }
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' }
  }
  
  // Allow today and future dates
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (date < today) {
    return { isValid: false, error: 'Due date cannot be in the past' }
  }
  
  return { isValid: true }
}

/**
 * Validate priority
 */
export function validatePriority(priority: string): ValidationResult {
  const validPriorities: Priority[] = ['low', 'medium', 'high', 'critical']
  
  if (!validPriorities.includes(priority as Priority)) {
    return { isValid: false, error: 'Invalid priority level' }
  }
  
  return { isValid: true }
}

/**
 * Validate tag name
 */
export function validateTagName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Tag name is required' }
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Tag name must be less than 50 characters' }
  }
  
  // Check for special characters that might cause issues
  const invalidChars = /[<>"/\\|?*]/
  if (invalidChars.test(name)) {
    return { isValid: false, error: 'Tag name contains invalid characters' }
  }
  
  return { isValid: true }
}

/**
 * Validate hex color
 */
export function validateColor(color: string): ValidationResult {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  
  if (!hexColorRegex.test(color)) {
    return { isValid: false, error: 'Invalid color format. Use hex format (e.g., #FF0000)' }
  }
  
  return { isValid: true }
}

/**
 * Validate entire todo form data
 */
export function validateTodoForm(data: {
  text: string
  priority: string
  dueDate?: string
}): ValidationResult {
  const textValidation = validateTodoText(data.text)
  if (!textValidation.isValid) return textValidation
  
  const priorityValidation = validatePriority(data.priority)
  if (!priorityValidation.isValid) return priorityValidation
  
  const dueDateValidation = validateDueDate(data.dueDate)
  if (!dueDateValidation.isValid) return dueDateValidation
  
  return { isValid: true }
}

/**
 * Validate tag form data
 */
export function validateTagForm(data: {
  name: string
  color: string
}): ValidationResult {
  const nameValidation = validateTagName(data.name)
  if (!nameValidation.isValid) return nameValidation
  
  const colorValidation = validateColor(data.color)
  if (!colorValidation.isValid) return colorValidation
  
  return { isValid: true }
}
