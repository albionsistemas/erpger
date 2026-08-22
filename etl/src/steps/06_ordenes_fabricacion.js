const config = require('../config');
const { insertBatch, syncIdentitySequence } = require('../lib/batch');
const { cleanText, parseIntOrNull, parseDate } = require('../lib/dates');
const { resolveUsuario, warn } = require('../lib/cache');

async function run({ mysqlPool, pgClient, ctx }) {
    const [rows] = await mysqlPool.query(
        `SELECT id_of, of, cliente, fecha, usuario, nota, rubro_albion, fecha_entrega,
                ref, pautas, layout, vendedor, estado
         FROM \`of\``
    );

    const fallbackEstadoOf = ctx.estadosOfIds.size > 0 ? Math.min(...ctx.estadosOfIds) : null;
    let droppedSinFecha = 0;
    const prepared = [];

    for (const r of rows) {
        const numeroOf = r.id_of + config.ofNumeroOffset;

        const tipoNombre = cleanText(r.of)?.toUpperCase() ?? null;
        const tipoOrdenId = tipoNombre ? ctx.tiposOrdenByNombre.get(tipoNombre) ?? null : null;
        if (tipoNombre && !tipoOrdenId) {
            warn(ctx, `of.id_of=${r.id_of}: tipo "${tipoNombre}" sin mapeo en tipos_orden, se migra con tipo_orden_id NULL`);
        }

        const clienteId = parseIntOrNull(r.cliente);
        if (clienteId !== null && !ctx.clienteIds.has(clienteId)) {
            warn(ctx, `of.id_of=${r.id_of}: cliente="${r.cliente}" no resuelto en catalogo.clientes, se migra con cliente_id NULL`);
        }

        const fecha = parseDate(r.fecha) ?? parseDate(r.fecha_entrega);
        if (!fecha) {
            warn(ctx, `of.id_of=${r.id_of}: sin fecha valida (ni 'fecha' ni 'fecha_entrega'), fila DESCARTADA`);
            droppedSinFecha += 1;
            continue;
        }

        const rubroId = parseIntOrNull(r.rubro_albion);
        if (rubroId !== null && !ctx.rubroIds.has(rubroId)) {
            warn(ctx, `of.id_of=${r.id_of}: rubro_albion=${rubroId} no existe en rubros_albion, se migra con rubro_id NULL`);
        }

        let estadoId = parseIntOrNull(r.estado);
        if (estadoId === null || !ctx.estadosOfIds.has(estadoId)) {
            warn(ctx, `of.id_of=${r.id_of}: estado="${r.estado}" invalido, se usa estado por defecto (${fallbackEstadoOf})`);
            estadoId = fallbackEstadoOf;
        }

        const vendedorId = await resolveUsuario(ctx, pgClient, r.vendedor);
        const creadoPor = await resolveUsuario(ctx, pgClient, r.usuario);

        prepared.push([
            r.id_of,
            numeroOf,
            tipoOrdenId,
            clienteId && ctx.clienteIds.has(clienteId) ? clienteId : null,
            fecha,
            parseDate(r.fecha_entrega),
            rubroId && ctx.rubroIds.has(rubroId) ? rubroId : null,
            cleanText(r.ref),
            cleanText(r.nota),
            cleanText(r.layout),
            cleanText(r.pautas),
            vendedorId,
            estadoId,
            creadoPor,
            fecha,
        ]);

        ctx.ofNumeroToId.set(numeroOf, r.id_of);
    }

    await insertBatch(pgClient, {
        table: 'ingenieria.ordenes_fabricacion',
        columns: [
            'id', 'numero_of', 'tipo_orden_id', 'cliente_id', 'fecha', 'fecha_entrega', 'rubro_id',
            'referencia', 'nota', 'layout_url', 'pautas_url', 'vendedor_id', 'estado_id', 'creado_por', 'creado_en',
        ],
        rows: prepared,
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'ingenieria.ordenes_fabricacion');

    return { ordenesFabricacion: prepared.length, descartadasSinFecha: droppedSinFecha };
}

module.exports = { run };
