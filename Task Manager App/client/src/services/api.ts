import axios, { AxiosResponse } from 'axios'
import {
  User,
  Task,
  Category,
  Comment,
  Attachment,
  LoginData,
  RegisterData,
  CreateTaskData,
  UpdateTaskData,
  CreateCategoryData,
  UpdateCategoryData,
  AuthResponse,
  ApiResponse
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const authData = JSON.parse(token)
      if (authData.state?.token) {
        config.headers.Authorization = `Bearer ${authData.state.token}`
      }
    } catch (error) {
      console.error('Error parsing auth token:', error)
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data)
    return response.data
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/auth/me')
    return response.data
  },
}

// Tasks API
export const tasksApi = {
  getTasks: async (params?: {
    status?: string
    priority?: string
    categoryId?: string
    search?: string
  }): Promise<ApiResponse<Task[]>> => {
    const response: AxiosResponse<ApiResponse<Task[]>> = await api.get('/tasks', { params })
    return response.data
  },

  getTask: async (id: string): Promise<ApiResponse<Task>> => {
    const response: AxiosResponse<ApiResponse<Task>> = await api.get(`/tasks/${id}`)
    return response.data
  },

  createTask: async (data: CreateTaskData): Promise<ApiResponse<Task>> => {
    const response: AxiosResponse<ApiResponse<Task>> = await api.post('/tasks', data)
    return response.data
  },

  updateTask: async (id: string, data: UpdateTaskData): Promise<ApiResponse<Task>> => {
    const response: AxiosResponse<ApiResponse<Task>> = await api.put(`/tasks/${id}`, data)
    return response.data
  },

  deleteTask: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/tasks/${id}`)
    return response.data
  },

  reorderTasks: async (tasks: { id: string; position: number }[]): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.put('/tasks/reorder', { tasks })
    return response.data
  },

  addComment: async (taskId: string, content: string): Promise<ApiResponse<Comment>> => {
    const response: AxiosResponse<ApiResponse<Comment>> = await api.post(`/tasks/${taskId}/comments`, { content })
    return response.data
  },

  getComments: async (taskId: string): Promise<ApiResponse<Comment[]>> => {
    const response: AxiosResponse<ApiResponse<Comment[]>> = await api.get(`/tasks/${taskId}/comments`)
    return response.data
  },

  deleteComment: async (taskId: string, commentId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/tasks/${taskId}/comments/${commentId}`)
    return response.data
  },

  addDependency: async (taskId: string, prerequisiteTaskId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/tasks/${taskId}/dependencies`, { prerequisiteTaskId })
    return response.data
  },

  removeDependency: async (taskId: string, prerequisiteTaskId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/tasks/${taskId}/dependencies/${prerequisiteTaskId}`)
    return response.data
  },
}

// Categories API
export const categoriesApi = {
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response: AxiosResponse<ApiResponse<Category[]>> = await api.get('/categories')
    return response.data
  },

  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    const response: AxiosResponse<ApiResponse<Category>> = await api.get(`/categories/${id}`)
    return response.data
  },

  createCategory: async (data: CreateCategoryData): Promise<ApiResponse<Category>> => {
    const response: AxiosResponse<ApiResponse<Category>> = await api.post('/categories', data)
    return response.data
  },

  updateCategory: async (id: string, data: UpdateCategoryData): Promise<ApiResponse<Category>> => {
    const response: AxiosResponse<ApiResponse<Category>> = await api.put(`/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/categories/${id}`)
    return response.data
  },
}

// Uploads API
export const uploadsApi = {
  uploadFile: async (taskId: string, file: File): Promise<ApiResponse<Attachment>> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('taskId', taskId)

    const response: AxiosResponse<ApiResponse<Attachment>> = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteFile: async (attachmentId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/uploads/${attachmentId}`)
    return response.data
  },

  downloadFile: async (attachmentId: string): Promise<Blob> => {
    const response: AxiosResponse<Blob> = await api.get(`/uploads/${attachmentId}/download`, {
      responseType: 'blob',
    })
    return response.data
  },
}

export default api