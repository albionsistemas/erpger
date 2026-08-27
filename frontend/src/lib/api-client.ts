import axios, { type AxiosError } from 'axios'
import { toast } from 'sonner'
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

// Extrae un mensaje legible de un error de la API NestJS. El
// ValidationPipe manda `message` como array de strings; el resto de
// los errores (NotFoundException, ForbiddenException, etc.) lo mandan
// como string simple.
function extraerMensaje(error: AxiosError): string {
  const data = error.response?.data as { message?: string | string[] } | undefined
  if (data?.message) {
    return Array.isArray(data.message) ? data.message.join('; ') : data.message
  }
  if (error.response) return `Error ${error.response.status}`
  return 'No se pudo conectar con el servidor'
}

// Ningun formulario/pantalla de la app mostraba nada cuando un guardado
// o borrado fallaba (sin notificationProvider en Refine, sin catch en
// las paginas hand-rolled) -- quedaba en silencio total. Centralizado
// aca: cualquier request que pase por apiClient (Refine dataProvider
// incluido) muestra un toast en vez de fallar mudo.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
      toast.error('Tu sesion expiro, iniciá sesion de nuevo.')
    } else {
      toast.error(extraerMensaje(error))
    }
    return Promise.reject(error)
  },
)
