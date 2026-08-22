# ETL Ingenieria/OF — MySQL legacy (local) -> PostgreSQL

Migra los datos de `backup_desarrollo2013.sql` hacia el schema de
`db/postgresql/001_ingenieria_schema.sql`. Nunca se conecta a produccion:
siempre contra un MySQL local con el dump ya importado.

## 1. Preparar el origen (MySQL local)

Importar el dump en un MySQL/MariaDB local (XAMPP, Docker, instalacion
nativa, lo que tengas a mano):

```
mysql -u root -p -e "CREATE DATABASE desarrollo2013 CHARACTER SET utf8mb4"
mysql -u root -p desarrollo2013 < ../backup_desarrollo2013.sql
```

## 2. Preparar el destino (PostgreSQL)

```
psql -U postgres -c "CREATE DATABASE albion_erp"
psql -U postgres -d albion_erp -f ../db/postgresql/001_ingenieria_schema.sql
```

## 3. Configurar

```
cp .env.example .env
```

Editar `.env` con las credenciales reales de tu MySQL/Postgres locales.
`OF_NUMERO_OFFSET`/`OT_NUMERO_OFFSET` estan confirmados contra el codigo
fuente PHP legacy (`COPIA_OF/`), no deberian necesitar ajuste.

## 4. Instalar dependencias y correr

```
npm install
npm run migrate
```

El script corre 11 pasos en orden (catalogos -> usuarios -> operarios ->
articulos -> maquinas -> OF -> OT -> tareas -> BOM -> ot_cambios ->
planificacion), cada uno en su propia transaccion. Si un paso falla, hace
ROLLBACK de ese paso y se detiene (los pasos anteriores ya commiteados
quedan aplicados).

## 5. Revisar advertencias

Al final imprime cuantas advertencias hubo (referencias que no se
pudieron resolver, filas descartadas por falta de una fecha/OF valida,
etc.) y las guarda completas en `logs/migracion_<timestamp>.log`. Ninguna
advertencia frena la migracion — son casos de datos legacy inconsistentes
que se migran de la forma mas conservadora posible (dejando el campo en
NULL o, cuando el dato es indispensable, descartando esa fila puntual).
Revisar el log antes de dar la migracion por definitiva.

## Decisiones y supuestos a confirmar con el equipo

- **`numero_of = id_of + 3000` / `numero_ot = id_ot + 5000`**: CONFIRMADOS
  leyendo el codigo fuente PHP legacy en `COPIA_OF/` (`of_listar.php`
  linea 264, `maquina_convertir_clon.php` linea 145 y 20+ archivos mas
  usando el mismo +5000 para OT). Ya no son una inferencia.
- **`tareas` -> sector ARMADO**: el nombre de la tabla no lo dice
  explicitamente (a diferencia de `tareas_mec` = MECANIZADO); es la
  hipotesis mas razonable por eliminacion.
- **`maquinas_rubros` (legacy `rub_maq19`) NO se migra**: referencia
  `maquinas_2019`, que quedo fuera de alcance. Si se necesita, requiere
  un mapeo manual plano<->plano entre `maquinas` y `maquinas_2019`.
- **`ordenes_tipo`/`of_estados`/`ot_estados`/`tipomaquinas`/`rubros_albion`/
  `tiposdearticulos`**: se preserva el ID legacy tal cual en Postgres
  (ver comentarios en el DDL) para poder resolver las FKs numericas sin
  crosswalks adicionales.
