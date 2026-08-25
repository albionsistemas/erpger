const DIAS_NUEVO = 60

// "Nuevo" = dado de alta hace menos de 60 dias. Se usa para marcar
// articulos/maquinas recien cargados en cualquier lista/ficha donde
// aparezcan.
export function esNuevo(fecha: string | Date | null | undefined): boolean {
  if (!fecha) return false
  const ms = Date.now() - new Date(fecha).getTime()
  return ms >= 0 && ms < DIAS_NUEVO * 24 * 60 * 60 * 1000
}
