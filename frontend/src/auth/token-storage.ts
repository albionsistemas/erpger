import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from './types'

const TOKEN_KEY = 'albion_erp_token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    if (payload.exp * 1000 < Date.now()) return null // vencido
    return payload
  } catch {
    return null
  }
}

export function getCurrentPayload(): JwtPayload | null {
  const token = tokenStorage.get()
  if (!token) return null
  return decodeToken(token)
}
