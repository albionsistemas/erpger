const { insertBatch } = require('../lib/batch');
const { cleanText, parseIntOrNull, parseDate } = require('../lib/dates');
const { resolveUsuario, warn } = require('../lib/cache');

const FECHA_DESCONOCIDA = '2013-01-01T00:00:00Z';

// 'tareas' y 'tareas_mec' son dos tablas legacy con el MISMO esquema,
// separadas solo por el sector que las carga (armado vs mecanizado). El
// nombre de 'tareas_mec' lo deja claro; 'tareas' (sin sufijo) se asume
// ARMADO por eliminacion -- confirmar con el equipo si en la practica
// se uso para algo mas general.
const SOURCES = [
    { table: 'tareas', sector: 'ARMADO' },
    { table: 'tareas_mec', sector: 'MECANIZADO' },
];

async function run({ mysqlPool, pgClient, ctx }) {
    const prepared = [];
    let descartadasSinOt = 0;

    for (const { table, sector } of SOURCES) {
        const sectorId = ctx.sectoresByNombre.get(sector);
        const [rows] = await mysqlPool.query(
            `SELECT id, nombre_tarea, F_TERMINACION, F_INICIO, usuario, ot, tecnico FROM \`${table}\``
        );

        for (const r of rows) {
            const otNumero = parseIntOrNull(r.ot);
            const otId = otNumero !== null ? ctx.otNumeroToId.get(otNumero) ?? null : null;
            if (!otId) {
                warn(ctx, `${table}.id=${r.id}: OT "${r.ot}" no resuelta, fila DESCARTADA`);
                descartadasSinOt += 1;
                continue;
            }

            const operarioId = parseIntOrNull(r.tecnico);
            if (operarioId !== null && !ctx.operarioIds.has(operarioId)) {
                warn(ctx, `${table}.id=${r.id}: tecnico=${operarioId} no existe en operarios, se migra con operario_id NULL`);
            }

            const fechaInicio = parseDate(r.F_INICIO);
            const fechaTerminacion = parseDate(r.F_TERMINACION);
            const creadoPor = await resolveUsuario(ctx, pgClient, r.usuario);

            prepared.push([
                otId,
                sectorId,
                cleanText(r.nombre_tarea) ?? '(sin definir)',
                fechaInicio,
                fechaTerminacion,
                operarioId && ctx.operarioIds.has(operarioId) ? operarioId : null,
                creadoPor,
                fechaInicio ?? fechaTerminacion ?? FECHA_DESCONOCIDA,
            ]);
        }
    }

    await insertBatch(pgClient, {
        table: 'ingenieria.tareas',
        columns: ['ot_id', 'sector_id', 'nombre_tarea', 'fecha_inicio', 'fecha_terminacion', 'operario_id', 'creado_por', 'creado_en'],
        rows: prepared,
    });

    return { tareas: prepared.length, descartadasSinOt };
}

module.exports = { run };
