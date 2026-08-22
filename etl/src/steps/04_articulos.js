const { insertBatch, syncIdentitySequence } = require('../lib/batch');
const { cleanText, parseIntOrNull, parseDate } = require('../lib/dates');
const { resolveUsuario, warn } = require('../lib/cache');

// Fallback cuando AltaFecha es '0000-00-00' (muy comun en el dump) y
// tampoco hay UltimaFecha util: no usamos "now()" porque implicaria que
// el articulo se creo durante la migracion, lo cual seria enganoso.
const FECHA_ALTA_DESCONOCIDA = '2013-01-01T00:00:00Z';

async function run({ mysqlPool, pgClient, ctx }) {
    const [rows] = await mysqlPool.query(
        `SELECT CodigodeArticulo, NombredeArticulos, TipodeArticulo, AgrupacionNivel2, CodigoAlbion,
                PLANO, denocomercial, estado_art, des, usuario, AltaFecha, UltimaFecha
         FROM articulos`
    );

    const prepared = [];
    for (const r of rows) {
        const id = r.CodigodeArticulo;
        if (id === null || id === undefined) continue;

        const categoriaId = parseIntOrNull(r.TipodeArticulo);
        if (categoriaId !== null && !ctx.categoriaIds.has(categoriaId)) {
            warn(ctx, `articulos.CodigodeArticulo=${id}: TipodeArticulo=${categoriaId} no existe en tiposdearticulos, se migra con categoria_id NULL`);
        }

        const subcategoriaId = parseIntOrNull(r.AgrupacionNivel2);
        if (subcategoriaId !== null && !ctx.subcategoriaIds.has(subcategoriaId)) {
            warn(ctx, `articulos.CodigodeArticulo=${id}: AgrupacionNivel2=${subcategoriaId} no existe en agrupadosnivel2, se migra con subcategoria_id NULL`);
        }

        const creadoPor = await resolveUsuario(ctx, pgClient, r.usuario);
        const creadoEn = parseDate(r.AltaFecha) ?? parseDate(r.UltimaFecha) ?? FECHA_ALTA_DESCONOCIDA;

        prepared.push([
            id,
            cleanText(r.NombredeArticulos) ?? `(sin nombre #${id})`,
            categoriaId && ctx.categoriaIds.has(categoriaId) ? categoriaId : null,
            subcategoriaId && ctx.subcategoriaIds.has(subcategoriaId) ? subcategoriaId : null,
            cleanText(r.CodigoAlbion),
            cleanText(r.PLANO),
            cleanText(r.denocomercial),
            cleanText(r.estado_art) ?? 'Nuevo',
            cleanText(r.des),
            creadoPor,
            creadoEn,
        ]);
    }

    await insertBatch(pgClient, {
        table: 'catalogo.articulos',
        columns: [
            'id', 'nombre', 'categoria_id', 'subcategoria_id', 'codigo_albion', 'plano_principal',
            'denominacion_comercial', 'estado', 'descripcion', 'creado_por', 'creado_en',
        ],
        rows: prepared,
        onConflict: 'ON CONFLICT (id) DO NOTHING',
    });
    await syncIdentitySequence(pgClient, 'catalogo.articulos');

    prepared.forEach((r) => ctx.articuloIds.add(r[0]));
    return prepared.length;
}

module.exports = { run };
