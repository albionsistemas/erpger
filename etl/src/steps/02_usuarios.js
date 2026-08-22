const { insertBatch } = require('../lib/batch');
const { normalizeUsername } = require('../lib/cache');

// El legacy no tiene una tabla central de "usuarios del sistema": los
// logins (german, jpablo, adrian, cristian, orlenis, decostap, ...)
// aparecen como texto libre repetido en decenas de columnas distintas.
// Este paso barre todas las columnas relevantes del modulo, deduplica y
// puebla core.usuarios de una sola vez, para que el resto de los pasos
// solo tengan que resolver username -> id contra el cache en memoria.
const USERNAME_SOURCES = [
    { table: 'of', columns: ['usuario', 'vendedor'] },
    { table: 'o_trabajo', columns: ['usuario', 'usuario_rev', 'U_CORTE', 'U_PLEG', 'U_FABRIC', 'U_PINT', 'U_ARMA', 'U_MECA'] },
    { table: 'ot_cambios', columns: ['USU_01', 'USU_02'] },
    { table: 'tareas', columns: ['usuario'] },
    { table: 'tareas_mec', columns: ['usuario'] },
    { table: 'despiecemaquinas', columns: ['usuario'] },
    { table: 'despiece_ensambles', columns: ['usuario'] },
    { table: 'despiece_ot', columns: ['usuario'] },
    { table: 'planifica', columns: ['usuario'] },
    { table: 'maquinas', columns: ['usuario'] },
    { table: 'articulos', columns: ['usuario'] },
];

async function run({ mysqlPool, pgClient, ctx }) {
    const usernames = new Set();

    for (const { table, columns } of USERNAME_SOURCES) {
        for (const column of columns) {
            const [rows] = await mysqlPool.query(
                `SELECT DISTINCT \`${column}\` AS u FROM \`${table}\` WHERE \`${column}\` IS NOT NULL AND \`${column}\` <> ''`
            );
            rows.forEach((r) => {
                const normalized = normalizeUsername(r.u);
                if (normalized) usernames.add(normalized);
            });
        }
    }

    const list = Array.from(usernames).sort();

    await insertBatch(pgClient, {
        table: 'core.usuarios',
        columns: ['username'],
        rows: list.map((u) => [u]),
        onConflict: 'ON CONFLICT (username) DO NOTHING',
    });

    const { rows } = await pgClient.query('SELECT id, username FROM core.usuarios');
    rows.forEach((r) => ctx.usuarios.set(r.username, r.id));

    return { usuarios: list.length };
}

module.exports = { run };
