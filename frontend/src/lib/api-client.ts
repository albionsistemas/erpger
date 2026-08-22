import axios from 'axios'
import { tokenStorage } from '@/auth/token-storage'

export const apiClient = axios.create({
  baseURL: '/api',
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el token vence/es invalido, el backend responde 401 -> forzamos
// logout local (redirect lo maneja el authProvider.onError de Refine).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
    }
    return Promise.reject(error)
  },
)
