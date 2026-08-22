const { insertBatch, syncIdentitySequence } = require('../lib/batch');
const { cleanText, toBool01, parseIntOrNull } = require('../lib/dates');
const { warn } = require('../lib/cache');

async function migrateOperarios({ mysqlPool, pgClient, ctx }) {
    const [rows] = await mysqlPool.query(
        'SELECT `id`, `nombre`, `imagen`, `activo`, `sector` FROM `operarios`'
    );

    const clean = rows.map((r) => {
        const sectorNombre = cleanText(r.sector)?.toUpperCase() ?? null;
        const sectorId = sectorNombre ? ctx.sectoresByNombre.get(sectorNombre) ?? null : null;
        if (sectorNombre && !sectorId) {
            warn(ctx, `operarios.id=${r.id}: sector "${sectorNombre}" sin mapeo en sectores_produccion, se migra con sector_id NULL`);
        }
        return {
            id: r.id,
            nombre: cleanText(r.nombre) ?? `(sin nombre #${r.id})`,
            sectorId,
            activo: toBool01(r.activo) ?? true,
            imagenUrl: cleanText(r.imagen),
        };
    });

    await insertBatch(pgClient, {
        table: 'ingenieria.operarios',
        columns: ['id', 'nombre', 'sector_id', 'activo', 'imagen_url'],
        rows: clean.map((r) => [r.id, r.nombre, r.sectorId, r.activo, r.imagenUrl]),
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'ingenieria.operarios');

    clean.forEach((r) => ctx.operarioIds.add(r.id));
    return clean.length;
}

async function migrateClientesStub({ mysqlPool, pgClient, ctx }) {
    const [rows] = await mysqlPool.query(
        "SELECT DISTINCT `cliente` AS codigo FROM `of` WHERE `cliente` IS NOT NULL AND `cliente` <> ''"
    );

    const clean = [];
    for (const r of rows) {
        const id = parseIntOrNull(r.codigo);
        if (id === null) {
            warn(ctx, `of.cliente="${r.codigo}" no es numerico, no se puede crear stub en catalogo.clientes; las OF con ese cliente quedaran con cliente_id NULL`);
            continue;
        }
        clean.push(id);
    }

    await insertBatch(pgClient, {
        table: 'catalogo.clientes',
        columns: ['id', 'razon_social'],
        rows: clean.map((id) => [id, `Cliente #${id} (pendiente migrar desde clientesalbion)`]),
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'catalogo.clientes');

    clean.forEach((id) => ctx.clienteIds.add(id));
    return clean.length;
}

async function run(deps) {
    const operarios = await migrateOperarios(deps);
    const clientes = await migrateClientesStub(deps);
    return { operarios, clientesStub: clientes };
}

module.exports = { run };
