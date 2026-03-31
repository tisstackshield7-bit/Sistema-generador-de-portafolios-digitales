import { create } from 'zustand'
import { authService } from '../services'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
    set({ token })
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authService.login({ email, password })
      set({
        user: data.user,
        token: data.token,
        loading: false,
      })
      localStorage.setItem('auth_token', data.token)
      return data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      set({ error: message, loading: false })
      throw error
    }
  },

  register: async (name, email, password, password_confirmation, professional_title) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authService.register({
        name,
        email,
        password,
        password_confirmation,
        professional_title,
      })
      set({
        user: data.user,
        token: data.token,
        loading: false,
      })
      localStorage.setItem('auth_token', data.token)
      return data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrarse'
      set({ error: message, loading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      set({ user: null, token: null })
      localStorage.removeItem('auth_token')
    }
  },

  getCurrentUser: async () => {
    set({ loading: true })
    try {
      const { data } = await authService.getCurrentUser()
      set({ user: data, loading: false })
      return data
    } catch (error) {
      set({ loading: false, error: null })
      throw error
    }
  },

  isAuthenticated: () => !!localStorage.getItem('auth_token'),
}))
