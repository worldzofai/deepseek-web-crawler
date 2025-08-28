export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  progress: number
  position: number
  userId: string
  categoryId?: string
  category?: Category
  createdAt: string
  updatedAt: string
  comments?: Comment[]
  attachments?: Attachment[]
  dependencies?: TaskDependency[]
  dependents?: TaskDependency[]
}

export interface TaskDependency {
  id: string
  prerequisiteTaskId: string
  dependentTaskId: string
  prerequisiteTask?: Task
  dependentTask?: Task
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  taskId: string
  userId: string
  user?: User
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  taskId: string
  userId: string
  createdAt: string
}

export interface CreateTaskData {
  title: string
  description?: string
  priority: TaskPriority
  dueDate?: string
  estimatedHours?: number
  categoryId?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  progress?: number
  position?: number
  categoryId?: string
}

export interface CreateCategoryData {
  name: string
  description?: string
  color: string
  icon?: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  color?: string
  icon?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
  }
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: Task
}

export interface DragResult {
  draggableId: string
  type: string
  source: {
    droppableId: string
    index: number
  }
  destination?: {
    droppableId: string
    index: number
  }
}