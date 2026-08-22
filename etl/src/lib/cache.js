// Estado en memoria compartido entre todos los pasos del ETL. Se crea una
// sola vez en run.js y se pasa por referencia a cada paso, para poder
// resolver foreign keys (usuario -> id, articulo -> id, OF/OT por numero
// visible, etc.) sin tener que re-consultar Postgres constantemente.

function createContext() {
    return {
        usuarios: new Map(),          // username normalizado -> core.usuarios.id
        operarioIds: new Set(),       // ids validos de ingenieria.operarios
        articuloIds: new Set(),       // ids validos de catalogo.articulos
        clienteIds: new Set(),        // ids validos (stub) de catalogo.clientes
        rubroIds: new Set(),
        categoriaIds: new Set(),
        subcategoriaIds: new Set(),
        tipoMaquinaIds: new Set(),
        tiposOrdenByNombre: new Map(),// 'FABRICACION' -> id
        estadosOfIds: new Set(),
        estadosOtByNombre: new Map(), // texto legacy tal cual ('C','P','80%'...) -> id
        sectoresByNombre: new Map(),  // 'CORTE' -> id, etc
        tiposCambioByNombre: new Map(),
        ofNumeroToId: new Map(),      // numero_of -> ordenes_fabricacion.id
        otNumeroToId: new Map(),      // numero_ot -> ordenes_trabajo.id
        despieceOtIds: new Set(),
        pendingPlanificaLinks: [],    // [{despieceOtId, idPlanificaLegacy}] para el UPDATE diferido del paso 11
        warnings: [],
    };
}

function normalizeUsername(raw) {
    if (raw === null || raw === undefined) return null;
    const text = String(raw).trim().toLowerCase();
    return text === '' ? null : text;
}

async function resolveUsuario(ctx, pgClient, rawUsername) {
    const username = normalizeUsername(rawUsername);
    if (!username) return null;
    if (ctx.usuarios.has(username)) return ctx.usuarios.get(username);

    // No deberia disparar seguido (el paso 02 precarga todos los usernames
    // vistos en el dump), pero si aparece uno nuevo lo damos de alta al vuelo.
    const result = await pgClient.query(
        `INSERT INTO core.usuarios (username) VALUES ($1)
         ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
         RETURNING id`,
        [username]
    );
    const id = result.rows[0].id;
    ctx.usuarios.set(username, id);
    return id;
}

function warn(ctx, message) {
    ctx.warnings.push(message);
}

module.exports = { createContext, normalizeUsername, resolveUsuario, warn };
