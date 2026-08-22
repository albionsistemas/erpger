const { insertBatch, syncIdentitySequence } = require('../lib/batch');
const { cleanText, parseIntOrNull, parseDate } = require('../lib/dates');
const { resolveUsuario, warn } = require('../lib/cache');

async function batchUpdatePlanificacionId(pgClient, links, batchSize) {
    let updated = 0;
    for (let i = 0; i < links.length; i += batchSize) {
        const chunk = links.slice(i, i + batchSize);
        if (chunk.length === 0) continue;

        const values = [];
        const tuples = chunk.map((link, idx) => {
            const base = idx * 2;
            values.push(link.despieceOtId, link.idPlanificaLegacy);
            return `($${base + 1}::bigint, $${base + 2}::bigint)`;
        });

        const sql = `
            UPDATE ingenieria.despiece_ot AS d
            SET planificacion_id = v.planificacion_id
            FROM (VALUES ${tuples.join(', ')}) AS v(id, planificacion_id)
            WHERE d.id = v.id`;
        const result = await pgClient.query(sql, values);
        updated += result.rowCount;
    }
    return updated;
}

async function run({ mysqlPool, pgClient, ctx }) {
    const [rows] = await mysqlPool.query(
        'SELECT id, f_inicio, f_entrega, usuario, ordentrabajo, operador, datos, nota FROM planifica'
    );

    const prepared = [];
    const itemsPrepared = [];
    let descartadasSinOt = 0;
    let descartadasSinFecha = 0;

    for (const r of rows) {
        const otNumero = parseIntOrNull(r.ordentrabajo);
        const otId = otNumero !== null ? ctx.otNumeroToId.get(otNumero) ?? null : null;
        if (!otId) {
            warn(ctx, `planifica.id=${r.id}: OT "${r.ordentrabajo}" no resuelta, fila DESCARTADA`);
            descartadasSinOt += 1;
            continue;
        }

        const fechaInicio = parseDate(r.f_inicio) ?? parseDate(r.f_entrega);
        const fechaEntrega = parseDate(r.f_entrega) ?? parseDate(r.f_inicio);
        if (!fechaInicio || !fechaEntrega) {
            warn(ctx, `planifica.id=${r.id}: sin fecha_inicio/fecha_entrega validas, fila DESCARTADA`);
            descartadasSinFecha += 1;
            continue;
        }

        const operarioId = parseIntOrNull(r.operador);
        if (operarioId !== null && !ctx.operarioIds.has(operarioId)) {
            warn(ctx, `planifica.id=${r.id}: operador=${operarioId} no existe en operarios, se migra con operario_id NULL`);
        }

        const creadoPor = await resolveUsuario(ctx, pgClient, r.usuario);

        prepared.push([
            r.id,
            otId,
            fechaInicio,
            fechaEntrega,
            operarioId && ctx.operarioIds.has(operarioId) ? operarioId : null,
            cleanText(r.nota),
            creadoPor,
            fechaInicio,
        ]);

        // legacy: 'datos' es una lista de ids de despiece_ot separados por
        // coma (ej: '132063, 132064, 132066') guardada como texto plano.
        const idsTexto = cleanText(r.datos);
        if (idsTexto) {
            for (const part of idsTexto.split(',')) {
                const despieceOtId = parseIntOrNull(part);
                if (despieceOtId === null) continue;
                if (!ctx.despieceOtIds.has(despieceOtId)) {
                    warn(ctx, `planifica.id=${r.id}: datos incluye despiece_ot.Id=${despieceOtId} que no existe, se ignora`);
                    continue;
                }
                itemsPrepared.push([r.id, despieceOtId]);
            }
        }
    }

    await insertBatch(pgClient, {
        table: 'ingenieria.planificacion_corte',
        columns: ['id', 'ot_id', 'fecha_inicio', 'fecha_entrega', 'operario_id', 'nota', 'creado_por', 'creado_en'],
        rows: prepared,
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'ingenieria.planificacion_corte');

    await insertBatch(pgClient, {
        table: 'ingenieria.planificacion_corte_items',
        columns: ['planificacion_id', 'despiece_ot_id'],
        rows: itemsPrepared,
        onConflict: 'ON CONFLICT (planificacion_id, despiece_ot_id) DO NOTHING',
    });

    // Actualizacion diferida: despiece_ot.planificacion_id (legacy id_planifica)
    // solo se puede setear ahora que planificacion_corte ya tiene filas.
    const validLinks = ctx.pendingPlanificaLinks.filter((link) =>
        prepared.some((p) => p[0] === link.idPlanificaLegacy)
    );
    const skippedLinks = ctx.pendingPlanificaLinks.length - validLinks.length;
    if (skippedLinks > 0) {
        warn(ctx, `${skippedLinks} filas de despiece_ot referenciaban id_planifica inexistente en planifica, quedan con planificacion_id NULL`);
    }
    const updated = await batchUpdatePlanificacionId(pgClient, validLinks, 500);

    return {
        planificacionCorte: prepared.length,
        items: itemsPrepared.length,
        despieceOtActualizados: updated,
        descartadasSinOt,
        descartadasSinFecha,
    };
}

module.exports = { run };
