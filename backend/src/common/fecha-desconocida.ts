// legacy: cuando la fila original no tenia fecha (ej. maquinas.fecha =
// '0000-00-00'), el ETL/import la migro con un valor fijo de "fecha
// desconocida" en vez de inventar una: 2013-01-01 00:00 hora Argentina
// (America/Buenos_Aires, UTC-3) = 2013-01-01T03:00:00Z. Ver
// frontend/src/lib/nuevo.ts para el mismo chequeo del lado del cliente.
const FECHA_DESCONOCIDA_MS = new Date('2013-01-01T03:00:00Z').getTime();

export function esFechaDesconocida(fecha: Date | null | undefined): boolean {
    if (!fecha) return true;
    return fecha.getTime() === FECHA_DESCONOCIDA_MS;
}
