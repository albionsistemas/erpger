import { getCurrentPayload } from './token-storage'
import { nivelCumple, type NivelPermiso } from './types'

// Mismo criterio que `puedeVer` en AppLayout, pero reusable en
// cualquier pagina/componente para ocultar o deshabilitar acciones de
// escritura (crear/editar/borrar) segun el permiso real del usuario.
// El backend ya rechaza estas acciones con 403 -- esto es solo UX,
// para no mostrar botones que van a fallar.
export function tienePermiso(modulo: string, nivelRequerido: NivelPermiso = 'EDITAR'): boolean {
  const payload = getCurrentPayload()
  if (!payload) return false
  if (payload.esSuperadmin) return true
  const permiso = payload.permisos.find((p) => p.moduloClave === modulo)
  return nivelCumple(permiso?.nivel ?? 'SIN_ACCESO', nivelRequerido)
}

export function usePuedeEditar(modulo: string): boolean {
  return tienePermiso(modulo, 'EDITAR')
}
