# Avances del proyecto — ERP Albion

Registro de desarrollo del ERP nuevo (reemplazo del sistema legacy PHP5/MySQL de Albion, fabricante industrial). Este archivo se va actualizando a medida que se agregan módulos, se importan datos reales o se corrigen cosas importantes — no reemplaza al historial de git (`git log` tiene el detalle técnico de cada cambio), es un resumen legible de **qué hace el sistema hoy** y **cómo se fue construyendo**.

## Stack

- **Backend**: NestJS + Prisma, Postgres 18 (db `albion_erp`), puerto 3000, API bajo `/api`.
- **Frontend**: React + Refine + shadcn/ui (Tailwind v4), puerto 5173.
- **Datos legacy**: dump MySQL de `backup_desarrollo2013.sql` (2013–2026), parseado directo con scripts puntuales — nunca se levantó un MySQL vivo. Las imágenes/PDF/DXF originales vienen de carpetas `COPIA_IMG`/`COPIA_OF` provistas por el usuario.
- **Auth**: JWT + permisos por módulo (`SIN_ACCESO` / `VER` / `EDITAR`), un superadmin que se salta todos los chequeos.

## Módulos y funcionalidades

### Ingeniería
- **Máquinas** — catálogo por plano (id único). Lista con orden por cualquier columna, paginado de 50, export a Excel. Ficha con imagen, PDF y DXF vinculados, fecha de alta y usuario cargador.
- **Tipo de Máquinas** — catálogo simple (código + nombre).
- **Despiece de Máquinas** — lista de materiales (BOM) por máquina. Reproduce las 5 pestañas del sistema viejo (General / Corte / Compras / Pantógrafo / Chapas), cada una con su lógica de filtro propia. Impresión de PDF por pestaña. **94.200 líneas reales** importadas.
- **Layout** — pantalla placeholder, todavía no tiene modelo de datos ni funcionalidad real (equivalente legacy: `lineas`).

### Planificación
- **Órdenes de Fabricación (OF)** — CRUD completo. **630 filas reales** importadas.
- **Órdenes de Trabajo (OT)** — CRUD completo, con 4 pestañas en la ficha:
  - **Etapas**: avance por sector (Ingeniería/Corte/Plegado/Fabricación/Mecanizado/Pintura/Armado) con **porcentaje real** de avance (no solo completo/pendiente).
  - **Terceros**: subcontratistas asignados a la OT.
  - **Tareas**: tareas por sector y operario.
  - **Imágenes**: fotos de la OT (**5414 fotos reales** vinculadas).
  - **2700 filas reales** importadas (de 2710 en la legacy; 10 excluidas por ser huérfanas reales de la base vieja, no un error del import).
- **Despiece de OT** — lista de materiales **real** usada/fabricada por cada OT (puede diferir de la lista nominal de la máquina por reemplazos de stock o precio). **157.028 filas reales** importadas. Todavía **sin pantalla propia** — los datos están en la base pero no hay tab para verlos en la ficha de OT.
- **Planificación de Corte** — modelo de datos existe, sin importar todavía (legacy `planifica`, 28 filas, pendiente).

### Ventas
- **Clientes** — CRUD completo, **1327 filas reales**. Cada cliente puede tener varios **Contactos** (**1363 reales**) con foto.

### Compras
- **Categorías / Subcategorías** — catálogos CRUD para clasificar artículos.
- **Monedas y Cotizaciones** — catálogo de monedas con historial de tipo de cambio.
- **Artículos** — catálogo completo, **10.665 filas reales**, con historial de precio en USD, imagen y PDF.

### Ajustes
- **Empresas** — las entidades legales propias de Albion (no clientes). CRUD con datos fiscales, bancarios y logo. 5 empresas reales cargadas.
- **Rubros** — líneas de producto agrícola (Aceitunas, Nueces, etc.), catálogo compartido usado por Artículos/Máquinas/OF. CRUD completo, **30 rubros reales** con imagen.
- **Operarios** — personal de planta (distinto de los usuarios que loguean al sistema). CRUD completo con foto, **86 filas reales**.

## Infraestructura y seguridad

- Login con JWT, permisos por módulo, superadmin bypass.
- Toast de error global: cualquier fallo al guardar/borrar (permiso insuficiente, validación, etc.) se muestra en pantalla — antes fallaba en silencio.
- Botones de crear/editar/borrar se ocultan según el permiso real del usuario (antes se mostraban siempre, aunque el backend fuera a rechazar la acción).
- `/uploads/*` (fotos, PDF, DXF) protegido con cookie de sesión — el sistema va a ser accedido desde afuera de la red de Albion, así que dejó de ser aceptable que cualquiera con la URL viera los archivos sin loguearse.

## Pendientes conocidos

- **Pantalla de Despiece de OT** en la ficha de la Orden de Trabajo (los datos ya están importados).
- **Catálogo de Terceros**: decidir si pasa de texto libre a una tabla maestra (hay 32 terceros reales disponibles en la legacy con dirección/teléfono/tipo).
- **`tareas` + `tareas_mec`**: decidir si se importan como una sola cosa o se mantienen distinguibles.
- **Planificación de Corte**: importar `planifica` (28 filas) — una vez hecho, `despiece_ot.planificacion_id` puede empezar a resolver (hoy queda NULL).
- **Layout**: diseñar el modelo de datos (hoy es un placeholder).
- **Dashboard / página de inicio**: no existe todavía, la app arranca en Órdenes de Fabricación.
- Detalles menores, sin apuro: el módulo `rrhh` sigue en el catálogo de módulos sin gatear nada real (Operarios se administra desde Ajustes).

## Registro cronológico

### 2026-08-22 — Primera versión
Arranca el proyecto: módulo Ingeniería/OF y Auth/RBAC.

### 2026-08-24 — Compras y Máquinas reales
- Módulo Compras: Categorías, Subcategorías, Monedas, y Artículos completo.
- Import real de Máquinas, con bitácora de costo/cotización por usuario.
- Vinculación de imágenes y PDF de máquinas, filtro por tipo, columna Recursos.

### 2026-08-25 — Despiece de Máquinas, Ajustes, Clientes/OF reales
Día largo de trabajo:
- PDF de artículos vinculado correctamente (estaba en la carpeta equivocada).
- DXF de máquinas vinculado leyendo el nombre interno de cada zip.
- Primera versión de Despiece de Máquinas (BOM), después reemplazada por las 5 pestañas fieles al legacy (General/Corte/Compras/Pantógrafo/Chapas).
- Varios ajustes de UX en Despiece: denominación bajo el artículo, el nombre de la máquina lleva al despiece, el nombre del artículo lleva a "en qué máquinas se usa", imágenes con fallback, columna Corte simplificada a código con color, nota como ícono con popover.
- Import real de `despiece_maquinas`: **94.200 líneas**, corrigiendo de paso la clasificación de chapas.
- Impresión de PDF por pestaña de despiece.
- Ficha de Máquinas y de Artículos: fecha de alta y usuario cargador.
- Lista de Máquinas: orden por más reciente, columnas ordenables, paginado de 50, export a Excel.
- Nuevo módulo **Ajustes**: CRUD de Empresas (datos fiscales, banco, logo), 5 empresas reales.
- Import real de **Clientes** (1327) y **Órdenes de Fabricación** (630).

### 2026-08-27 — Órdenes de Trabajo, Despiece de OT, Operarios, auditoría general
- CRUD de **Rubros** en Ajustes (el catálogo ya existía, solo se usaba de solo lectura).
- Import real de **Órdenes de Trabajo** (2700 filas) con avance por sector en porcentaje real.
- Import real de **Despiece de OT** (157.028 filas) — la lista de materiales real usada por cada OT, con `articulo_texto` preservado siempre porque puede diferir del artículo nominal.
- **Operarios** conectado: CRUD real (86 filas) con foto, ubicado en Ajustes.
- Import de **Imágenes de OT** (5414 fotos reales).
- Auditoría general del sistema (dos análisis en paralelo + revisión de datos/infraestructura). Se corrigió: toast de error global (nada fallaba en silencio), índices faltantes en `ot_imagenes`/`ot_terceros`, y permisos de escritura ocultos del lado del cliente en las ~22 pantallas con acciones de escritura.
- `/uploads/*` protegido con cookie de sesión, de cara a que el sistema se va a acceder desde afuera de la red de Albion.
- Imágenes reales para los 30 Rubros.
