const { insertBatch, syncIdentitySequence } = require('../lib/batch');
const { cleanText, parseIntOrNull, parseDate, parseLegacySlashDate } = require('../lib/dates');
const { resolveUsuario, warn } = require('../lib/cache');

const FECHA_ALTA_DESCONOCIDA = '2013-01-01T00:00:00Z';

async function run({ mysqlPool, pgClient, ctx }) {
    const [rows] = await mysqlPool.query(
        `SELECT id, IdPlano, TipodeMaquina, NombredeMaquina, ValorMateriales, FechaValorMateriales,
                detalle_maquina, tipo_hierro, usuario, precio_lista, moneda, descripcion, usos,
                ancho, largo, alto, ancho_util, largo_util, diametro, capacidad,
                imagen, pdf, dxf, fecha
         FROM maquinas`
    );

    const seenPlanoId = new Set();
    const prepared = [];

    for (const r of rows) {
        const tipoMaquinaId = parseIntOrNull(r.TipodeMaquina);
        if (tipoMaquinaId !== null && !ctx.tipoMaquinaIds.has(tipoMaquinaId)) {
            warn(ctx, `maquinas.id=${r.id}: TipodeMaquina=${tipoMaquinaId} no existe en tipomaquinas, se migra con tipo_maquina_id NULL`);
        }

        let planoId = cleanText(r.IdPlano) ?? `SIN-PLANO-${r.id}`;
        if (seenPlanoId.has(planoId)) {
            warn(ctx, `maquinas.id=${r.id}: IdPlano="${planoId}" duplicado, se renombra a "${planoId}__dup${r.id}" para no violar UNIQUE`);
            planoId = `${planoId}__dup${r.id}`;
        }
        seenPlanoId.add(planoId);

        const creadoPor = await resolveUsuario(ctx, pgClient, r.usuario);
        const creadoEn = parseDate(r.fecha) ?? FECHA_ALTA_DESCONOCIDA;

        prepared.push([
            r.id,
            planoId,
            tipoMaquinaId && ctx.tipoMaquinaIds.has(tipoMaquinaId) ? tipoMaquinaId : null,
            cleanText(r.NombredeMaquina) ?? `(sin nombre #${r.id})`,
            cleanText(r.detalle_maquina),
            cleanText(r.descripcion),
            cleanText(r.usos),
            cleanText(r.tipo_hierro),
            parseIntOrNull(r.ancho),
            parseIntOrNull(r.largo),
            parseIntOrNull(r.alto),
            parseIntOrNull(r.ancho_util),
            parseIntOrNull(r.largo_util),
            parseIntOrNull(r.diametro),
            parseIntOrNull(r.capacidad),
            cleanText(r.imagen),
            cleanText(r.pdf),
            cleanText(r.dxf),
            r.precio_lista ?? null,
            cleanText(r.moneda),
            r.ValorMateriales ?? null,
            parseLegacySlashDate(r.FechaValorMateriales),
            creadoPor,
            creadoEn,
        ]);
    }

    await insertBatch(pgClient, {
        table: 'ingenieria.maquinas',
        columns: [
            'id', 'plano_id', 'tipo_maquina_id', 'nombre', 'detalle', 'descripcion', 'usos', 'tipo_hierro',
            'ancho_mm', 'largo_mm', 'alto_mm', 'ancho_util_mm', 'largo_util_mm', 'diametro_mm', 'capacidad',
            'imagen_url', 'pdf_url', 'dxf_url', 'precio_lista', 'moneda', 'valor_materiales',
            'fecha_valor_materiales', 'creado_por', 'creado_en',
        ],
        rows: prepared,
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'ingenieria.maquinas');

    warn(ctx, 'ingenieria.maquinas_rubros: NO se migro (rub_maq19 referencia maquinas_2019, que quedo fuera de alcance por decision de negocio; requiere mapeo manual plano<->plano si se necesita mas adelante).');

    return { maquinas: prepared.length };
}

module.exports = { run };
