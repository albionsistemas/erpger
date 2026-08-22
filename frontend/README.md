# Frontend — ERP Albion

React + TypeScript + Vite, [Refine](https://refine.dev) (headless) +
shadcn/ui (Tailwind v4). Contra el backend NestJS de `../backend`.

## Por que Refine en vez de una plantilla estatica

Con roles/permisos por modulo transversales a todo el ERP, el
`accessControlProvider` de Refine centraliza el chequeo de permisos una
sola vez (`src/providers/accessControlProvider.ts`) en vez de repetirlo
a mano en cada pantalla de cada modulo futuro (Planificacion, Ventas,
Compras, RRHH, Almacen...).

## Correr

```
npm install
npm run dev
```

El `vite.config.ts` proxea `/api` y `/uploads` a `http://localhost:3000`
(el backend), asi que hace falta tenerlo corriendo (ver `../backend/README.md`,
incluye como crear el primer superadmin).

## Estructura

- `src/providers/` — `dataProvider` (adapta la paginacion/filtros de
  Refine a la forma de nuestra API), `authProvider` (JWT en
  localStorage), `accessControlProvider` (permisos por modulo)
- `src/auth/` — decodificacion del JWT, tipos espejo del backend
- `src/layout/AppLayout.tsx` — sidebar + header; el sidebar oculta
  items segun los permisos del usuario
- `src/components/ui/` — primitivos shadcn/ui escritos a mano (Button,
  Input, Select, Table, Card, Tabs, Badge) — no via el CLI de shadcn,
  mismo patron (Radix + class-variance-authority + tailwind-merge)
- `src/pages/ordenes-fabricacion/`, `src/pages/ordenes-trabajo/` —
  modulo Ingenieria (list/create/edit/show). Los sub-recursos de OT
  (etapas, terceros, tareas, imagenes) NO son resources de Refine: se
  consultan directo con `apiClient` en `*-tab.tsx` dentro de
  `pages/ordenes-trabajo/`, porque Refine asume URLs planas
  `/resource/:id` y estos son anidados `/ordenes-trabajo/:id/etapas`.

## Catalogos (dropdowns)

Los endpoints `/catalogos/*` devuelven un array plano, no el formato
`{data,total}` de Refine — por eso los selects (tipo de orden, estado,
rubro, sector...) usan `useCatalogo()` (`src/hooks/useCatalogo.ts`,
wrapper de `useCustom`) en vez de `useSelect`.

## Pendiente / proximos pasos

- Pantallas de Maquinas, Operarios, Articulos (ya tienen API lista, ver
  `../backend/README.md`) — faltan las paginas, siguiendo el mismo
  patron que ordenes-fabricacion/ordenes-trabajo.
- Pantalla de administracion de usuarios/permisos (superadmin): CRUD de
  `/usuarios`, asignar `/usuarios/:id/permisos`, imagen de perfil.
- El formulario de OF no incluye el campo "vendedor" todavia (existe en
  el backend, se omitio en el primer formulario por espacio/tiempo).
- Code-splitting: el bundle actual pesa ~625kB — no es un problema para
  un ERP interno con pocos usuarios, pero conviene dynamic `import()`
  por modulo cuando la app crezca (Refine soporta esto de forma nativa).
