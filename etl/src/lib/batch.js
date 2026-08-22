// Nota de seguridad: 'table' y 'column' en este modulo SIEMPRE vienen de
// literales escritos en los scripts de migracion (nunca de datos del dump
// ni de input externo), por eso se interpolan directo en el SQL. Los
// VALORES de las filas si van siempre parametrizados ($1, $2, ...).

async function insertBatch(pgClient, { table, columns, rows, batchSize = 500, onConflict = '' }) {
    let inserted = 0;
    for (let i = 0; i < rows.length; i += batchSize) {
        const chunk = rows.slice(i, i + batchSize);
        if (chunk.length === 0) continue;

        const values = [];
        const tuples = chunk.map((row, rowIdx) => {
            const base = rowIdx * columns.length;
            const placeholders = columns.map((_, colIdx) => `$${base + colIdx + 1}`).join(', ');
            values.push(...row);
            return `(${placeholders})`;
        });

        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${tuples.join(', ')} ${onConflict}`;
        await pgClient.query(sql, values);
        inserted += chunk.length;
    }
    return inserted;
}

async function syncIdentitySequence(pgClient, table, column = 'id') {
    await pgClient.query(
        `SELECT setval(pg_get_serial_sequence($1, $2), GREATEST((SELECT COALESCE(MAX(${column}), 0) FROM ${table}), 1))`,
        [table, column]
    );
}

module.exports = { insertBatch, syncIdentitySequence };
