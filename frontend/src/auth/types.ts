// Espejo de backend/src/auth/types.ts — el payload viaja en el JWT.
export type NivelPermiso = 'SIN_ACCESO' | 'VER' | 'EDITAR'

export interface PermisoModulo {
  moduloClave: string
  nivel: NivelPermiso
}

export interface JwtPayload {
  sub: string
  username: string
  esSuperadmin: boolean
  empresaId: string | null // seam de multi-tenancy, sin uso en UI todavia
  permisos: PermisoModulo[]
  iat: number
  exp: number
}

const ORDEN_NIVEL: Record<NivelPermiso, number> = {
  SIN_ACCESO: 0,
  VER: 1,
  EDITAR: 2,
}

export function nivelCumple(nivelUsuario: NivelPermiso, nivelRequerido: NivelPermiso): boolean {
  return ORDEN_NIVEL[nivelUsuario] >= ORDEN_NIVEL[nivelRequerido]
}
