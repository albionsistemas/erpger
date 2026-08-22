# Backend — ERP Albion

NestJS + TypeScript + Prisma, contra los schemas de
`db/postgresql/001_ingenieria_schema.sql` (modulo Ingenieria) y
`db/postgresql/002_core_auth.sql` (usuarios/permisos, transversal a
todos los modulos).

## Requisitos previos

1. Aplicar ambos DDL en Postgres, en orden: `001_ingenieria_schema.sql`
   y despues `002_core_auth.sql`.
2. Idealmente, correr el ETL (`../etl`) para tener datos reales para probar.

## Configurar y correr

```
cp .env.example .env
```

Editar `DATABASE_URL` y `JWT_SECRET` en `.env` con valores reales.

```
npm install
npm run prisma:generate
npm run start:dev
```

Queda escuchando en `http://localhost:3000/api`.

## Primer login

No hay ningun usuario en la base hasta que se corre el seed:

```
ADMIN_USERNAME=tu_usuario ADMIN_PASSWORD="algo-largo-y-random" npm run seed:superadmin
```

Despues `POST /api/auth/login` con `{ username, password }` devuelve un
`accessToken` (JWT) para usar como `Authorization: Bearer <token>` en el
resto de los endpoints.

## Usuarios, roles y permisos

No hay un catalogo de "roles" con nombre fijo: cada usuario tiene un
nivel de acceso independiente por modulo (`SIN_ACCESO` / `VER` /
`EDITAR`), guardado en `core.usuario_modulo_permisos`. Un usuario
`esSuperadmin=true` se salta todos los chequeos.

- `POST /auth/login` (publico) — devuelve el JWT
- `GET /auth/me` — usuario autenticado actual (con sus permisos)
- `/usuarios` — CRUD, solo superadmin (excepto `GET /usuarios/:id`,
  `PATCH /usuarios/:id/password` y `POST /usuarios/:id/imagen`, que
  tambien puede hacer el propio usuario sobre si mismo)
- `PUT /usuarios/:id/permisos` — reemplaza el set completo de permisos
  de un usuario (solo superadmin)
- `/modulos` — catalogo de modulos del ERP (Ingenieria, Planificacion,
  Ventas, Compras, RRHH, Almacen...). Lectura para cualquier usuario
  logueado, alta/baja solo superadmin — asi se puede sumar un modulo
  nuevo sin tocar codigo ni migraciones.

Cada controller de negocio esta decorado con `@Permiso('<modulo>', 'VER'|'EDITAR')`
(ver `src/common/decorators/permiso.decorator.ts` y
`src/common/guards/permissions.guard.ts`). Una ruta sin ese decorador
solo exige estar autenticado (ej: `/catalogos/*`, lectura de `/articulos`).

Reparto de modulos (definido por el negocio, no por como esta armado el
codigo -- Ingenieria y Planificacion comparten backend/DB pero son
permisos distintos):
- `ingenieria`: `/maquinas`, `/operarios`, `/despiece-maquinas`,
  `/despiece-ensambles`, `/despiece-ot`, `/ot-cambios`
- `planificacion`: `/ordenes-fabricacion`, `/ordenes-trabajo` (+ sus
  sub-recursos), `/planificacion-corte`

Las imagenes de perfil se guardan en `uploads/perfiles/` y se sirven
como archivos estaticos en `/uploads/...`. Para produccion, cambiar
`FileInterceptor` en `usuarios.controller.ts` para subir a un storage
externo (S3 o similar) en vez de disco local.

## Estructura

Un modulo NestJS por recurso, todos bajo `/api`:

- `GET /catalogos/*` — lookups de solo lectura (tipos-orden, estados-of,
  estados-ot, sectores-produccion, tipos-maquina, tipos-cambio-bom,
  rubros, tipos-articulo)
- `/operarios`, `/articulos`, `/maquinas` — CRUD
- `/ordenes-fabricacion` — CRUD + filtros (cliente, estado, tipo, rango
  de fechas, texto libre)
- `/ordenes-trabajo` — CRUD + sub-recursos anidados:
  - `/ordenes-trabajo/:id/etapas` (GET, PATCH por sector — marca avance)
  - `/ordenes-trabajo/:id/terceros` (CRUD)
  - `/ordenes-trabajo/:id/imagenes` (GET, POST, DELETE)
  - `/ordenes-trabajo/:id/tareas` (CRUD)
- `/despiece-maquinas`, `/despiece-ensambles`, `/despiece-ot` — CRUD (3
  tablas separadas, mismo formato de fila)
- `/ot-cambios` — solo lectura (bitacora de cambios del despiece)
- `/planificacion-corte` — CRUD + `/planificacion-corte/:id/items`

## Decisiones pendientes / notas

- **`creado_por`/`revisado_por` todavia no se completan automaticamente**:
  ahora que existe Auth, falta el paso de tomar `@CurrentUser()` en cada
  controller de Ingenieria y pasarlo al service para setear esos campos
  (por ahora quedan NULL al crear via API).
- **Permisos como snapshot en el JWT**: si un superadmin cambia los
  permisos de un usuario logueado, ese usuario los sigue viendo viejos
  hasta que vuelve a loguearse (no hay revocacion instantanea). Aceptable
  para v1; si hace falta instantaneo, la solucion es acortar el
  vencimiento del token + refresh tokens.
- **`ot_cambios` es de solo lectura por API**: se genera desde el flujo
  de edicion del BOM, no se escribe a mano. Si se agrega edicion
  asistida de piezas en el frontend, esa logica deberia escribir la
  bitacora desde el propio servicio de `despiece-ot`, no exponer un
  POST publico en `/ot-cambios`.
- **IDs BIGINT**: casi todas las PK/FK son `bigint`. Las respuestas HTTP
  los serializan como `number` (parche de `BigInt.prototype.toJSON` en
  `main.ts`) porque estan muy lejos de `Number.MAX_SAFE_INTEGER` en este
  dominio — no hace falta manejarlos como string en el frontend.
- **`prisma/schema.prisma` es un espejo del DDL**, no la fuente de
  verdad: el DDL se aplica a mano/via `psql`. Si se edita el DDL,
  actualizar este archivo en paralelo (o correr `prisma db pull`).
