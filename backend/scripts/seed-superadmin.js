// Crea (o resetea la contrasena de) el primer usuario superadmin.
// No corre via NestJS: es un script standalone contra Prisma directo,
// pensado para correrse una sola vez por entorno.
//
// Tambien crea (si no existe) la primera empresa/tenant y se la asigna
// -- seam minimo de multi-tenancy, ver db/postgresql/003_empresas.sql.
//
// Uso:
//   ADMIN_USERNAME=german ADMIN_PASSWORD="algo-largo-y-random" ADMIN_EMPRESA="Albion S.A." node scripts/seed-superadmin.js

require('dotenv/config');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

async function main() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    const nombre = process.env.ADMIN_NOMBRE ?? 'Administrador';
    const nombreEmpresa = process.env.ADMIN_EMPRESA ?? 'Empresa por defecto';

    if (!username || !password) {
        console.error('Faltan ADMIN_USERNAME y/o ADMIN_PASSWORD como variables de entorno.');
        process.exit(1);
    }
    if (password.length < 8) {
        console.error('ADMIN_PASSWORD debe tener al menos 8 caracteres.');
        process.exit(1);
    }

    const prisma = new PrismaClient();
    const passwordHash = await bcrypt.hash(password, 10);

    let empresa = await prisma.empresa.findFirst({ where: { nombre: nombreEmpresa } });
    if (!empresa) {
        empresa = await prisma.empresa.create({ data: { nombre: nombreEmpresa } });
    }

    const usuario = await prisma.usuario.upsert({
        where: { username: username.trim().toLowerCase() },
        update: { passwordHash, esSuperadmin: true, activo: true, empresaId: empresa.id },
        create: {
            username: username.trim().toLowerCase(),
            nombre,
            passwordHash,
            esSuperadmin: true,
            activo: true,
            empresaId: empresa.id,
        },
    });

    console.log(`Empresa: ${empresa.nombre} (id ${empresa.id})`);
    console.log(`Superadmin listo: ${usuario.username} (id ${usuario.id})`);
    await prisma.$disconnect();
}

main().catch(async (err) => {
    console.error(err);
    process.exit(1);
});
