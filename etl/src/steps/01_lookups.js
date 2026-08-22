const { insertBatch, syncIdentitySequence } = require('../lib/batch');
const { cleanText } = require('../lib/dates');
const { warn } = require('../lib/cache');

// Catalogos que SI tienen tabla legacy propia con id numerico referenciado
// por otras tablas (of.estado, of.rubro_albion, maquinas.TipodeMaquina,
// articulos.TipodeArticulo). Se preserva el id original 1:1.

async function migrateSimpleLookup(mysqlPool, pgClient, { source, idCol, nombreCol, target }) {
    const [rows] = await mysqlPool.query(
        `SELECT \`${idCol}\` AS id, \`${nombreCol}\` AS nombre FROM \`${source}\``
    );

    const clean = rows
        .map((r) => ({ id: r.id, nombre: cleanText(r.nombre) }))
        .filter((r) => r.id !== null && r.id !== undefined && r.nombre !== null);

    await insertBatch(pgClient, {
        table: target,
        columns: ['id', 'nombre'],
        rows: clean.map((r) => [r.id, r.nombre]),
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, target);

    return clean;
}

async function loadSyntheticLookup(pgClient, table) {
    const { rows } = await pgClient.query(`SELECT id, nombre FROM ${table}`);
    return rows;
}

async function run({ mysqlPool, pgClient, ctx }) {
    const tiposOrden = await migrateSimpleLookup(mysqlPool, pgClient, {
        source: 'ordenes_tipo', idCol: 'id', nombreCol: 'tipo', target: 'ingenieria.tipos_orden',
    });
    tiposOrden.forEach((r) => ctx.tiposOrdenByNombre.set(r.nombre.toUpperCase(), r.id));

    const estadosOf = await migrateSimpleLookup(mysqlPool, pgClient, {
        source: 'of_estados', idCol: 'id_of_estados', nombreCol: 'of_estado', target: 'ingenieria.estados_of',
    });
    estadosOf.forEach((r) => ctx.estadosOfIds.add(r.id));

    const estadosOt = await migrateSimpleLookup(mysqlPool, pgClient, {
        source: 'ot_estados', idCol: 'id_ot_estados', nombreCol: 'ot_estados', target: 'ingenieria.estados_ot',
    });
    estadosOt.forEach((r) => ctx.estadosOtByNombre.set(r.nombre, r.id));

    const categorias = await migrateSimpleLookup(mysqlPool, pgClient, {
        source: 'tiposdearticulos', idCol: 'id', nombreCol: 'TipodeArticulo', target: 'catalogo.categorias',
    });
    categorias.forEach((r) => ctx.categoriaIds.add(r.id));

    // agrupadosnivel2 = subcategorias, "Tipo-art" es la categoria padre.
    // La columna 'relacion' es un duplicado en texto de "Tipo-art", se descarta.
    const [subcategoriaRows] = await mysqlPool.query(
        'SELECT `id`, `txt_AgrupacionNivel2` AS nombre, `Tipo-art` AS categoria_id FROM `agrupadosnivel2`'
    );
    const subcategorias = subcategoriaRows
        .map((r) => ({ id: r.id, nombre: cleanText(r.nombre) ?? `(sin nombre #${r.id})`, categoriaId: r.categoria_id }))
        .filter((r) => r.id !== null && r.id !== undefined);
    for (const r of subcategorias) {
        if (r.categoriaId === null || !ctx.categoriaIds.has(r.categoriaId)) {
            warn(ctx, `agrupadosnivel2.id=${r.id}: Tipo-art=${r.categoriaId} no existe en tiposdearticulos, se omite esta subcategoria`);
        }
    }
    const subcategoriasValidas = subcategorias.filter((r) => ctx.categoriaIds.has(r.categoriaId));
    await insertBatch(pgClient, {
        table: 'catalogo.subcategorias',
        columns: ['id', 'categoria_id', 'nombre'],
        rows: subcategoriasValidas.map((r) => [r.id, r.categoriaId, r.nombre]),
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'catalogo.subcategorias');
    subcategoriasValidas.forEach((r) => ctx.subcategoriaIds.add(r.id));

    const rubros = await migrateSimpleLookup(mysqlPool, pgClient, {
        source: 'rubros_albion', idCol: 'id_Rubro', nombreCol: 'Rubro', target: 'catalogo.rubros',
    });
    rubros.forEach((r) => ctx.rubroIds.add(r.id));

    // tipomaquinas tiene una columna extra ('COD-N', casi siempre NULL en el dump).
    const [tipoMaquinaRows] = await mysqlPool.query(
        'SELECT `Idmaquina` AS id, `TipoMaquinas` AS nombre, `COD-N` AS codigo FROM `tipomaquinas`'
    );
    const tiposMaquina = tipoMaquinaRows
        .map((r) => ({ id: r.id, nombre: cleanText(r.nombre) ?? `(sin nombre #${r.id})`, codigo: cleanText(r.codigo) }))
        .filter((r) => r.id !== null && r.id !== undefined);
    await insertBatch(pgClient, {
        table: 'ingenieria.tipos_maquina',
        columns: ['id', 'nombre', 'codigo'],
        rows: tiposMaquina.map((r) => [r.id, r.nombre, r.codigo]),
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'ingenieria.tipos_maquina');
    tiposMaquina.forEach((r) => ctx.tipoMaquinaIds.add(r.id));

    // Catalogos sinteticos (sin tabla legacy propia): ya vienen sembrados
    // por el DDL (001_ingenieria_schema.sql). Solo cargamos los mapas.
    (await loadSyntheticLookup(pgClient, 'ingenieria.sectores_produccion'))
        .forEach((r) => ctx.sectoresByNombre.set(r.nombre, r.id));
    (await loadSyntheticLookup(pgClient, 'ingenieria.tipos_cambio_bom'))
        .forEach((r) => ctx.tiposCambioByNombre.set(r.nombre, r.id));

    return {
        tiposOrden: tiposOrden.length,
        estadosOf: estadosOf.length,
        estadosOt: estadosOt.length,
        categorias: categorias.length,
        subcategorias: subcategoriasValidas.length,
        rubros: rubros.length,
        tiposMaquina: tiposMaquina.length,
    };
}

module.exports = { run };
