import { useState, useEffect } from 'react'
import { User, LoginData, RegisterData } from '../types'
import { authApi } from '../services/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Simple state management using localStorage and React hooks
const AUTH_STORAGE_KEY = 'auth-storage'

const getStoredAuth = (): Partial<AuthState> => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        user: parsed.user,
        token: parsed.token,
        isAuthenticated: !!parsed.token
      }
    }
  } catch (error) {
    console.error('Error parsing stored auth:', error)
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false
  }
}

const setStoredAuth = (auth: Partial<AuthState>) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  } catch (error) {
    console.error('Error storing auth:', error)
  }
}

const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

// Global auth state - with bypass for development
const storedAuth = getStoredAuth()
let authState: AuthState = {
  user: {
    id: 'dev-user-1',
    email: 'dev@example.com',
    username: 'developer',
    firstName: 'Dev',
    lastName: 'User',
    createdAt: new Date().toISOString()
  },
  token: 'dev-token-bypass',
  isAuthenticated: true, // Bypass login for development - always true
  isLoading: false,
  error: null
}

const listeners = new Set<() => void>()

const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

const updateAuthState = (updates: Partial<AuthState>) => {
  authState = { ...authState, ...updates }
  
  // Store persistent data
  if (updates.user !== undefined || updates.token !== undefined || updates.isAuthenticated !== undefined) {
    if (authState.isAuthenticated && authState.token) {
      setStoredAuth({
        user: authState.user,
        token: authState.token,
        isAuthenticated: authState.isAuthenticated
      })
    } else {
      clearStoredAuth()
    }
  }
  
  notifyListeners()
}

// Auth actions
export const authActions = {
  login: async (data: LoginData) => {
    try {
      updateAuthState({ isLoading: true, error: null })
      const response = await authApi.login(data)
      
      if (response.success) {
        updateAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } else {
        updateAuthState({
          error: 'Login failed',
          isLoading: false
        })
      }
    } catch (error: any) {
      updateAuthState({
        error: error.response?.data?.error?.message || error.message || 'Login failed',
        isLoading: false
      })
    }
  },

  register: async (data: RegisterData) => {
    try {
      updateAuthState({ isLoading: true, error: null })
      const response = await authApi.register(data)
      
      if (response.success) {
        updateAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } else {
        updateAuthState({
          error: 'Registration failed',
          isLoading: false
        })
      }
    } catch (error: any) {
      updateAuthState({
        error: error.response?.data?.error?.message || error.message || 'Registration failed',
        isLoading: false
      })
    }
  },

  logout: () => {
    updateAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    })
  },

  clearError: () => {
    updateAuthState({ error: null })
  },

  getCurrentUser: async () => {
    try {
      if (!authState.token) return

      updateAuthState({ isLoading: true })
      const response = await authApi.getCurrentUser()
      
      if (response.success && response.data) {
        updateAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false
        })
      } else {
        // Token might be expired
        authActions.logout()
      }
    } catch (error) {
      authActions.logout()
    }
  }
}

// Custom hook to use auth state
export const useAuthStore = () => {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    ...authState,
    ...authActions
  }
}