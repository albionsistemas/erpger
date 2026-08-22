import type { AccessControlProvider } from '@refinedev/core'
import { getCurrentPayload } from '@/auth/token-storage'
import { nivelCumple, type NivelPermiso } from '@/auth/types'

interface ResourceModuloConfig {
  writeModulo: string
  readModulo?: string // si no se especifica, lectura abierta a cualquier autenticado
}

// Mapea cada resource de Refine al modulo de negocio que lo gatea.
// Espejo de los @Permiso(...) del backend (ver backend/README.md,
// seccion "Reparto de modulos"). Ingenieria = maquinas/BOM/tecnico;
// Planificacion = OF/OT (cuando y quien las ejecuta). Operarios/Articulos
// son catalogos con lectura abierta pero CRUD de otro modulo (RRHH y
// Almacen respectivamente) -- Ingenieria los necesita para elegir un
// operario/articulo al armar el despiece, sin poder darlos de alta.
const RESOURCE_MODULO: Record<string, ResourceModuloConfig> = {
  maquinas: { readModulo: 'ingenieria', writeModulo: 'ingenieria' },
  'despiece-maquinas': { readModulo: 'ingenieria', writeModulo: 'ingenieria' },
  'despiece-ensambles': { readModulo: 'ingenieria', writeModulo: 'ingenieria' },
  'despiece-ot': { readModulo: 'ingenieria', writeModulo: 'ingenieria' },
  'ot-cambios': { readModulo: 'ingenieria', writeModulo: 'ingenieria' },
  operarios: { writeModulo: 'rrhh' },
  articulos: { writeModulo: 'almacen' },
  'ordenes-fabricacion': { readModulo: 'planificacion', writeModulo: 'planificacion' },
  'ordenes-trabajo': { readModulo: 'planificacion', writeModulo: 'planificacion' },
  'planificacion-corte': { readModulo: 'planificacion', writeModulo: 'planificacion' },
}

const ACCIONES_QUE_EDITAN = new Set(['create', 'edit', 'delete', 'clone'])

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    const payload = getCurrentPayload()
    if (!payload) return { can: false, reason: 'No autenticado' }
    if (payload.esSuperadmin) return { can: true }

    const config = resource ? RESOURCE_MODULO[resource] : undefined
    if (!config) return { can: true } // recurso sin modulo asociado (catalogos, etc)

    const esEscritura = ACCIONES_QUE_EDITAN.has(action)
    const moduloRequerido = esEscritura ? config.writeModulo : config.readModulo
    if (!moduloRequerido) return { can: true } // lectura abierta

    const nivelRequerido: NivelPermiso = esEscritura ? 'EDITAR' : 'VER'
    const permiso = payload.permisos.find((p) => p.moduloClave === moduloRequerido)
    const nivelUsuario = permiso?.nivel ?? 'SIN_ACCESO'

    if (!nivelCumple(nivelUsuario, nivelRequerido)) {
      return { can: false, reason: `Necesitas permiso de "${nivelRequerido}" en el modulo "${moduloRequerido}"` }
    }
    return { can: true }
  },
}
