const { insertBatch, syncIdentitySequence } = require('../lib/batch');
const { cleanText, parseIntOrNull, parseDate } = require('../lib/dates');
const { resolveUsuario, warn } = require('../lib/cache');

const FECHA_DESCONOCIDA = '2013-01-01T00:00:00Z';

function resolveArticulo(ctx, r, col, rowId) {
    const value = parseIntOrNull(r[col]);
    if (!value || value <= 0) return null;
    if (!ctx.articuloIds.has(value)) {
        warn(ctx, `ot_cambios.id=${rowId}: ${col}=${value} no existe en articulos, se migra con ese lado NULL`);
        return null;
    }
    return value;
}

async function run({ mysqlPool, pgClient, ctx }) {
    const [rows] = await mysqlPool.query(
        `SELECT id, fecha, ot, PLANO, PL, DENOMINACION, modo,
                CODN_01, ANCHO_01, LARGO_01, CANT_01, USU_01,
                CODN_02, ANCHO_02, LARGO_02, CANT_02, USU_02
         FROM ot_cambios`
    );

    const prepared = [];
    let descartadasSinModo = 0;

    for (const r of rows) {
        const modo = cleanText(r.modo)?.toUpperCase() ?? null;
        const tipoCambioId = modo ? ctx.tiposCambioByNombre.get(modo) ?? null : null;
        if (!tipoCambioId) {
            warn(ctx, `ot_cambios.id=${r.id}: modo="${r.modo}" sin mapeo en tipos_cambio_bom, fila DESCARTADA`);
            descartadasSinModo += 1;
            continue;
        }

        const otNumero = parseIntOrNull(r.ot);
        const otId = otNumero !== null ? ctx.otNumeroToId.get(otNumero) ?? null : null;

        const usuarioAnteriorId = await resolveUsuario(ctx, pgClient, r.USU_01);
        const usuarioNuevoId = await resolveUsuario(ctx, pgClient, r.USU_02);

        prepared.push([
            r.id,
            otId,
            parseDate(r.fecha) ?? FECHA_DESCONOCIDA,
            cleanText(r.PLANO),
            cleanText(r.PL),
            cleanText(r.DENOMINACION),
            tipoCambioId,
            resolveArticulo(ctx, r, 'CODN_01', r.id),
            parseIntOrNull(r.ANCHO_01),
            parseIntOrNull(r.LARGO_01),
            parseIntOrNull(r.CANT_01),
            usuarioAnteriorId,
            resolveArticulo(ctx, r, 'CODN_02', r.id),
            parseIntOrNull(r.ANCHO_02),
            parseIntOrNull(r.LARGO_02),
            parseIntOrNull(r.CANT_02),
            usuarioNuevoId,
        ]);
    }

    await insertBatch(pgClient, {
        table: 'ingenieria.ot_cambios',
        columns: [
            'id', 'ot_id', 'fecha', 'plano', 'pieza_codigo', 'denominacion', 'tipo_cambio_id',
            'articulo_anterior_id', 'ancho_anterior_mm', 'largo_anterior_mm', 'cantidad_anterior', 'usuario_anterior_id',
            'articulo_nuevo_id', 'ancho_nuevo_mm', 'largo_nuevo_mm', 'cantidad_nuevo', 'usuario_nuevo_id',
        ],
        rows: prepared,
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'ingenieria.ot_cambios');

    return { otCambios: prepared.length, descartadasSinModo };
}

module.exports = { run };
