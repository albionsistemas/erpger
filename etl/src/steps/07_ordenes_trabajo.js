const config = require('../config');
const { insertBatch, syncIdentitySequence } = require('../lib/batch');
const { cleanText, parseIntOrNull, parseDate } = require('../lib/dates');
const { resolveUsuario, warn } = require('../lib/cache');

// Las 7 columnas-flag (ING/CORTE/PLEG/FABRIC/MECA/PINT/ARMA) mas ESP
// (que en el legacy tiene los tipos de columna invertidos: F_ESP=fecha
// real aunque es varchar, U_ESP=vacio aunque es date, ESP=el flag 'C')
// se normalizan a una fila por etapa en ot_etapas. ING y ESP no tienen
// columna de usuario confiable en el legacy, quedan con usuario_id NULL.
const STAGE_FLAGS = [
    { sector: 'INGENIERIA', flagCol: 'ING', fechaCol: null, usuarioCol: null },
    { sector: 'CORTE', flagCol: 'CORTE', fechaCol: 'F_CORTE', usuarioCol: 'U_CORTE' },
    { sector: 'PLEGADO', flagCol: 'PLEG', fechaCol: 'F_PLEG', usuarioCol: 'U_PLEG' },
    { sector: 'FABRICACION', flagCol: 'FABRIC', fechaCol: 'F_FABRIC', usuarioCol: 'U_FABRIC' },
    { sector: 'MECANIZADO', flagCol: 'MECA', fechaCol: 'F_MECA', usuarioCol: 'U_MECA' },
    { sector: 'PINTURA', flagCol: 'PINT', fechaCol: 'F_PINT', usuarioCol: 'U_PINT' },
    { sector: 'ARMADO', flagCol: 'ARMA', fechaCol: 'F_ARMA', usuarioCol: 'U_ARMA' },
    { sector: 'ESPERA', flagCol: 'ESP', fechaCol: 'F_ESP', usuarioCol: null },
];

async function run({ mysqlPool, pgClient, ctx }) {
    const [rows] = await mysqlPool.query(
        `SELECT id_ot, cant, maquina, of, fecha, usuario, nota, PL, fecha_eje, ref, obs, usuario_rev,
                ING, CORTE, F_CORTE, U_CORTE, PLEG, F_PLEG, U_PLEG, FABRIC, F_FABRIC, U_FABRIC,
                MECA, F_MECA, U_MECA, PINT, F_PINT, U_PINT, ARMA, F_ARMA, U_ARMA, ESP, F_ESP,
                TERCERO1, F_INICIO_1, F_ENTREGA_1, TERCERO2, F_INICIO_2, F_ENTREGA_2,
                TERCERO3, F_INICIO_3, F_ENTREGA_3, TERCERO4, F_INICIO_4, F_ENTREGA_4,
                TERCERO5, F_INICIO_5, F_ENTREGA_5,
                estado, imagen1, imagen2, imagen3, imagen4, imagen5, imagen6,
                placa, serie, motor, ficha, id_ficha, version, ftd
         FROM o_trabajo`
    );

    const otRows = [];
    const etapaRows = [];
    const terceroRows = [];
    const imagenRows = [];
    let descartadasSinOf = 0;
    let descartadasSinFecha = 0;

    for (const r of rows) {
        const numeroOf = parseIntOrNull(r.of);
        const ofId = numeroOf !== null ? ctx.ofNumeroToId.get(numeroOf) ?? null : null;
        if (!ofId) {
            warn(ctx, `o_trabajo.id_ot=${r.id_ot}: no se pudo resolver OF a partir de of="${r.of}", fila DESCARTADA`);
            descartadasSinOf += 1;
            continue;
        }

        const fecha = parseDate(r.fecha) ?? parseDate(r.fecha_eje);
        if (!fecha) {
            warn(ctx, `o_trabajo.id_ot=${r.id_ot}: sin fecha valida, fila DESCARTADA`);
            descartadasSinFecha += 1;
            continue;
        }

        const estadoTexto = cleanText(r.estado);
        const estadoId = estadoTexto ? ctx.estadosOtByNombre.get(estadoTexto) ?? null : null;
        if (estadoTexto && !estadoId) {
            warn(ctx, `o_trabajo.id_ot=${r.id_ot}: estado="${estadoTexto}" sin mapeo en ot_estados, se migra con estado_id NULL`);
        }

        const revisadoPor = await resolveUsuario(ctx, pgClient, r.usuario_rev);
        const creadoPor = await resolveUsuario(ctx, pgClient, r.usuario);

        otRows.push([
            r.id_ot,                          // id
            ofId,                             // of_id
            r.id_ot + config.otNumeroOffset,  // numero_ot = id_ot + 5000, confirmado en el legacy
            null,                             // maquina_id: no se intenta matchear texto libre -> catalogo automaticamente
            cleanText(r.maquina) ?? '(sin definir)', // maquina_nombre
            parseIntOrNull(r.cant) ?? 1,       // cantidad
            cleanText(r.PL),                  // plano
            fecha,
            parseDate(r.fecha_eje),
            cleanText(r.nota),
            cleanText(r.ref),
            cleanText(r.obs),
            estadoId,
            revisadoPor,
            cleanText(r.placa),
            cleanText(r.serie),
            cleanText(r.motor),
            parseIntOrNull(r.id_ficha),
            cleanText(r.ficha),
            cleanText(r.version),
            parseIntOrNull(r.ftd),
            creadoPor,
            fecha,
        ]);

        ctx.otNumeroToId.set(r.id_ot + config.otNumeroOffset, r.id_ot);

        for (const stage of STAGE_FLAGS) {
            const flagValue = cleanText(r[stage.flagCol]);
            if (!flagValue) continue; // etapa no aplica a esta OT

            const completada = flagValue.trim().toUpperCase() === 'C';
            const fechaCompletada = stage.fechaCol ? parseDate(r[stage.fechaCol]) : null;
            const usuarioId = stage.usuarioCol ? await resolveUsuario(ctx, pgClient, r[stage.usuarioCol]) : null;
            const sectorId = ctx.sectoresByNombre.get(stage.sector);

            etapaRows.push([r.id_ot, sectorId, completada, fechaCompletada, usuarioId]);
        }

        for (let n = 1; n <= 5; n += 1) {
            const tercero = cleanText(r[`TERCERO${n}`]);
            if (!tercero) continue;
            terceroRows.push([
                r.id_ot,
                tercero,
                parseDate(r[`F_INICIO_${n}`]),
                parseDate(r[`F_ENTREGA_${n}`]),
            ]);
        }

        for (let n = 1; n <= 6; n += 1) {
            const url = cleanText(r[`imagen${n}`]);
            if (!url) continue;
            imagenRows.push([r.id_ot, url, n]);
        }
    }

    await insertBatch(pgClient, {
        table: 'ingenieria.ordenes_trabajo',
        columns: [
            'id', 'of_id', 'numero_ot', 'maquina_id', 'maquina_nombre', 'cantidad', 'plano', 'fecha',
            'fecha_ejecucion', 'nota', 'referencia', 'observaciones', 'estado_id', 'revisado_por',
            'placa', 'serie', 'motor', 'ficha_tecnica_id', 'ficha_documento', 'version', 'ftd',
            'creado_por', 'creado_en',
        ],
        rows: otRows,
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'ingenieria.ordenes_trabajo');

    await insertBatch(pgClient, {
        table: 'ingenieria.ot_etapas',
        columns: ['ot_id', 'sector_id', 'completada', 'fecha_completada', 'usuario_id'],
        rows: etapaRows,
        onConflict: 'ON CONFLICT (ot_id, sector_id) DO NOTHING',
    });

    await insertBatch(pgClient, {
        table: 'ingenieria.ot_terceros',
        columns: ['ot_id', 'tercero', 'fecha_inicio', 'fecha_entrega'],
        rows: terceroRows,
    });

    await insertBatch(pgClient, {
        table: 'ingenieria.ot_imagenes',
        columns: ['ot_id', 'url', 'orden'],
        rows: imagenRows,
    });

    return {
        ordenesTrabajo: otRows.length,
        etapas: etapaRows.length,
        terceros: terceroRows.length,
        imagenes: imagenRows.length,
        descartadasSinOf,
        descartadasSinFecha,
    };
}

module.exports = { run };
