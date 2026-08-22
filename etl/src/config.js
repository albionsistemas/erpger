require('dotenv').config();

function required(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (value === undefined) {
        throw new Error(`Falta la variable de entorno ${name} (ver .env.example)`);
    }
    return value;
}

module.exports = {
    mysql: {
        host: required('MYSQL_HOST', '127.0.0.1'),
        port: Number(required('MYSQL_PORT', '3306')),
        user: required('MYSQL_USER', 'root'),
        password: process.env.MYSQL_PASSWORD ?? '',
        database: required('MYSQL_DATABASE'),
    },
    pg: {
        host: required('PG_HOST', '127.0.0.1'),
        port: Number(required('PG_PORT', '5432')),
        user: required('PG_USER', 'postgres'),
        password: process.env.PG_PASSWORD ?? '',
        database: required('PG_DATABASE'),
    },
    batchSize: Number(process.env.BATCH_SIZE ?? 500),
    // Ambos offsets estan CONFIRMADOS en el codigo fuente PHP legacy
    // (COPIA_OF/of_listar.php linea 264, COPIA_OF/maquina_convertir_clon.php
    // linea 145), no son una inferencia: numero_of = id_of + 3000,
    // numero_ot = id_ot + 5000.
    ofNumeroOffset: Number(process.env.OF_NUMERO_OFFSET ?? 3000),
    otNumeroOffset: Number(process.env.OT_NUMERO_OFFSET ?? 5000),
};
