-- =====================================================================
-- ERP Albion - Saca precio_lista/moneda/valor_materiales de maquinas
--
-- Decision del usuario: no se usan en la practica (10/1618 = 0.6% para
-- precio_lista/moneda, 1/1618 para valor_materiales) y no interesa
-- llevarlos. Mismo criterio que "marca" en catalogo.articulos: se
-- elimina la columna en vez de dejarla muerta.
-- =====================================================================

ALTER TABLE ingenieria.maquinas
    DROP COLUMN IF EXISTS precio_lista,
    DROP COLUMN IF EXISTS moneda,
    DROP COLUMN IF EXISTS valor_materiales,
    DROP COLUMN IF EXISTS fecha_valor_materiales;
