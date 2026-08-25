const DIAS_NUEVO = 60

// "Nuevo" = dado de alta hace menos de 60 dias. Se usa para marcar
// articulos/maquinas recien cargados en cualquier lista/ficha donde
// aparezcan.
export function esNuevo(fecha: string | Date | null | undefined): boolean {
  if (!fecha) return false
  const ms = Date.now() - new Date(fecha).getTime()
  return ms >= 0 && ms < DIAS_NUEVO * 24 * 60 * 60 * 1000
}

// legacy: cuando la fila original no tenia fecha (ej. maquinas.fecha
// = '0000-00-00', despiece sin columna de fecha), el ETL/import la
// migro con un valor fijo de "fecha desconocida" en vez de inventar
// una: 2013-01-01 00:00 hora Argentina (America/Buenos_Aires, UTC-3,
// el timezone del servidor de Postgres) = 2013-01-01T03:00:00Z. Se usa
// este chequeo para no mostrar esa fecha como si fuera real en la UI.
const FECHA_DESCONOCIDA_MS = new Date('2013-01-01T03:00:00Z').getTime()
export function esFechaDesconocida(fecha: string | Date | null | undefined): boolean {
  if (!fecha) return true
  return new Date(fecha).getTime() === FECHA_DESCONOCIDA_MS
}
