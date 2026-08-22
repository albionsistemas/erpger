const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const config = require('./config');

async function openConnections() {
    const mysqlPool = mysql.createPool({
        ...config.mysql,
        waitForConnections: true,
        connectionLimit: 5,
        dateStrings: true, // evita que mysql2 explote con fechas '0000-00-00'
    });

    // Falla rapido y claro si el MySQL local no esta disponible o el dump
    // no fue importado, en vez de fallar a mitad de la migracion.
    await mysqlPool.query('SELECT 1');

    const pgPool = new Pool(config.pg);
    await pgPool.query('SELECT 1');

    return { mysqlPool, pgPool };
}

module.exports = { openConnections };
