-- =====================================================================
-- ERP Albion - Elimina Marca (Compras)
--
-- El usuario confirmo que "marca" nunca se uso en la practica (a pesar
-- de tener 375/10665 filas con un valor en el legacy) y pidio sacarla
-- del sistema. Se elimina la columna y la tabla completa: no queda
-- referenciada desde ningun otro lado.
-- =====================================================================

ALTER TABLE catalogo.articulos DROP COLUMN IF EXISTS marca_id;
DROP TABLE IF EXISTS catalogo.marcas;
