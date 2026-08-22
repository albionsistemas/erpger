import type { AuthProvider } from '@refinedev/core'
import { apiClient } from '@/lib/api-client'
import { tokenStorage, getCurrentPayload } from '@/auth/token-storage'

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const { data } = await apiClient.post('/auth/login', { username, password })
      tokenStorage.set(data.accessToken)
      return { success: true, redirectTo: '/' }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo iniciar sesion'
      return {
        success: false,
        error: { name: 'LoginError', message },
      }
    }
  },

  logout: async () => {
    tokenStorage.clear()
    return { success: true, redirectTo: '/login' }
  },

  check: async () => {
    const payload = getCurrentPayload()
    if (!payload) {
      tokenStorage.clear()
      return { authenticated: false, redirectTo: '/login' }
    }
    return { authenticated: true }
  },

  onError: async (error) => {
    if (error?.response?.status === 401) {
      tokenStorage.clear()
      return { logout: true, redirectTo: '/login' }
    }
    return { error }
  },

  getPermissions: async () => {
    const payload = getCurrentPayload()
    if (!payload) return null
    return { esSuperadmin: payload.esSuperadmin, permisos: payload.permisos }
  },

  getIdentity: async () => {
    const payload = getCurrentPayload()
    if (!payload) return null
    return { id: payload.sub, name: payload.username, esSuperadmin: payload.esSuperadmin }
  },
}
