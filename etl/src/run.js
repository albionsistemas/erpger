const fs = require('fs');
const path = require('path');
const { openConnections } = require('./db');
const { createContext } = require('./lib/cache');

const STEPS = [
    ['01 Catalogos base (tipos_orden, estados_of, estados_ot, tipos_maquina, rubros, tipos_articulo)', require('./steps/01_lookups')],
    ['02 Usuarios (core.usuarios)', require('./steps/02_usuarios')],
    ['03 Operarios y clientes stub', require('./steps/03_operarios_clientes')],
    ['04 Articulos', require('./steps/04_articulos')],
    ['05 Maquinas', require('./steps/05_maquinas')],
    ['06 Ordenes de Fabricacion (OF)', require('./steps/06_ordenes_fabricacion')],
    ['07 Ordenes de Trabajo (OT) + etapas/terceros/imagenes', require('./steps/07_ordenes_trabajo')],
    ['08 Tareas (armado + mecanizado)', require('./steps/08_tareas')],
    ['09 BOM / Despiece (maquinas, ensambles, OT)', require('./steps/09_despiece')],
    ['10 Bitacora de cambios (ot_cambios)', require('./steps/10_ot_cambios')],
    ['11 Planificacion de corte', require('./steps/11_planificacion')],
];

async function main() {
    const { mysqlPool, pgPool } = await openConnections();
    const ctx = createContext();

    console.log('Conexion a MySQL local y PostgreSQL establecida. Iniciando migracion...\n');

    for (const [label, stepModule] of STEPS) {
        const pgClient = await pgPool.connect();
        const startedAt = Date.now();
        try {
            await pgClient.query('BEGIN');
            const summary = await stepModule.run({ mysqlPool, pgClient, ctx });
            await pgClient.query('COMMIT');
            const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
            console.log(`OK   [${label}] (${seconds}s)`);
            console.log('     ', summary);
        } catch (err) {
            await pgClient.query('ROLLBACK').catch(() => {});
            console.error(`\nFALLO en paso [${label}]: ${err.message}`);
            console.error('Se hizo ROLLBACK de este paso. La migracion se detiene aqui (pasos anteriores ya quedaron confirmados en Postgres).');
            throw err;
        } finally {
            pgClient.release();
        }
    }

    console.log(`\n${ctx.warnings.length} advertencias durante la migracion.`);
    if (ctx.warnings.length > 0) {
        const logDir = path.join(__dirname, '..', 'logs');
        fs.mkdirSync(logDir, { recursive: true });
        const logPath = path.join(logDir, `migracion_${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
        fs.writeFileSync(logPath, ctx.warnings.join('\n'), 'utf8');
        console.log(`Detalle completo en: ${logPath}`);
        console.log('Primeras 20 advertencias:');
        ctx.warnings.slice(0, 20).forEach((w) => console.log(' - ' + w));
    }

    await mysqlPool.end();
    await pgPool.end();
    console.log('\nMigracion completa.');
}

module.exports = { main };
