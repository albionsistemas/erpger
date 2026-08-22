const { insertBatch, syncIdentitySequence } = require('../lib/batch');
const { cleanText, parseIntOrNull, parseDate, toBool01 } = require('../lib/dates');
const { resolveUsuario, warn } = require('../lib/cache');

const FECHA_DESCONOCIDA = '2013-01-01T00:00:00Z';

const BASE_COLUMNS = [
    'id', 'item', 'plano', 'pieza_codigo', 'denominacion', 'articulo_id', 'ancho_mm', 'largo_mm',
    'cantidad', 'tipo_corte', 'nota', 'es_chapa', 'cantidad_comprar', 'metros_largo_total',
    'metros_cantidad_total', 'barras_cantidad', 'observaciones_corte', 'es_repuesto',
    'verifica_stock', 'creado_por', 'creado_en',
];

// 'ARTICULO' (descripcion libre del material) se descarta a proposito:
// es texto redundante con catalogo.articulos.nombre una vez resuelto
// articulo_id via CODN.
async function buildBaseRow(ctx, pgClient, r) {
    const articuloId = parseIntOrNull(r.CODN);
    const articuloResuelto = articuloId && articuloId > 0 && ctx.articuloIds.has(articuloId) ? articuloId : null;
    if (articuloId && articuloId > 0 && !articuloResuelto) {
        warn(ctx, `despiece Id=${r.Id}: CODN=${articuloId} no existe en articulos, se migra con articulo_id NULL`);
    }

    const creadoPor = await resolveUsuario(ctx, pgClient, r.usuario);

    return [
        r.Id,
        parseIntOrNull(r.ITEM) ?? 0,
        cleanText(r.PLANO),
        cleanText(r.PL),
        cleanText(r.DENOMINACION),
        articuloResuelto,
        parseIntOrNull(r.ANCHO),
        parseIntOrNull(r.LARGO),
        parseIntOrNull(r.CANT) ?? 0,
        cleanText(r.COD),
        cleanText(r.NOTA),
        toBool01(r.chapas),
        parseIntOrNull(r.CANT_COM),
        parseIntOrNull(r.M_LARGO_TOTAL),
        parseIntOrNull(r.M_CANT_TOTAL),
        parseIntOrNull(r.B_CANT),
        cleanText(r.OBS_C),
        toBool01(r.repuestos),
        cleanText(r.v_stock) === '*',
        creadoPor,
    ];
}

async function migrateCatalogoBom({ mysqlPool, pgClient, ctx }, sourceTable, targetTable) {
    const [rows] = await mysqlPool.query(
        `SELECT Id, ITEM, PLANO, CODN, PL, DENOMINACION, ANCHO, LARGO, CANT, COD, NOTA,
                chapas, CANT_COM, M_LARGO_TOTAL, M_CANT_TOTAL, B_CANT, OBS_C, repuestos, usuario, v_stock
         FROM \`${sourceTable}\``
    );

    const prepared = [];
    for (const r of rows) {
        const base = await buildBaseRow(ctx, pgClient, r);
        prepared.push([...base, FECHA_DESCONOCIDA]); // creado_en: sin columna 'fecha' en el legacy para estas 2 tablas
    }

    await insertBatch(pgClient, {
        table: targetTable,
        columns: BASE_COLUMNS,
        rows: prepared,
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, targetTable);

    return prepared.length;
}

async function migrateDespieceOt({ mysqlPool, pgClient, ctx }) {
    const [rows] = await mysqlPool.query(
        `SELECT Id, ITEM, PLANO, CODN, PL, DENOMINACION, ANCHO, LARGO, CANT, COD, NOTA,
                chapas, CANT_COM, M_LARGO_TOTAL, M_CANT_TOTAL, B_CANT, OBS_C, repuestos, usuario, v_stock,
                OT, fecha, id_planifica, F_CORTEF, ope
         FROM despiece_ot`
    );

    const prepared = [];
    let descartadasSinOt = 0;

    for (const r of rows) {
        const otNumero = parseIntOrNull(r.OT);
        const otId = otNumero !== null ? ctx.otNumeroToId.get(otNumero) ?? null : null;
        if (!otId) {
            warn(ctx, `despiece_ot.Id=${r.Id}: OT "${r.OT}" no resuelta, fila DESCARTADA`);
            descartadasSinOt += 1;
            continue;
        }

        const base = await buildBaseRow(ctx, pgClient, r);
        const creadoEn = parseDate(r.fecha) ?? FECHA_DESCONOCIDA;

        prepared.push([...base, creadoEn, otId, null, parseDate(r.F_CORTEF), cleanText(r.ope)]);

        const idPlanifica = parseIntOrNull(r.id_planifica);
        if (idPlanifica) {
            ctx.pendingPlanificaLinks.push({ despieceOtId: r.Id, idPlanificaLegacy: idPlanifica });
        }
        ctx.despieceOtIds.add(r.Id);
    }

    await insertBatch(pgClient, {
        table: 'ingenieria.despiece_ot',
        columns: [...BASE_COLUMNS, 'ot_id', 'planificacion_id', 'fecha_corte_finalizado', 'operacion'],
        rows: prepared,
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'ingenieria.despiece_ot');

    return { insertadas: prepared.length, descartadasSinOt };
}

async function run(deps) {
    const despieceMaquinas = await migrateCatalogoBom(deps, 'despiecemaquinas', 'ingenieria.despiece_maquinas');
    const despieceEnsambles = await migrateCatalogoBom(deps, 'despiece_ensambles', 'ingenieria.despiece_ensambles');
    const despieceOt = await migrateDespieceOt(deps);

    return { despieceMaquinas, despieceEnsambles, ...despieceOt };
}

module.exports = { run };
