-- =====================================================================
-- ERP Albion - Imagen de articulo (Compras)
--
-- legacy: articulos.imagen (un solo campo, NO imagen1..imagen6 -- esas
-- columnas existen en `o_trabajo` y en `lineas`, tablas distintas, ver
-- ingenieria.ot_imagenes que ya esta armada -pero vacia- para OT).
-- 3920/10665 articulos del legacy tienen este campo cargado, con
-- nombres de archivo que en general coinciden con el CodigodeArticulo
-- (ej: "15352.jpg" para el articulo 15352). El link real de esos
-- archivos queda pendiente hasta tener la carpeta de jpg del PHP.
-- =====================================================================

ALTER TABLE catalogo.articulos
    ADD COLUMN imagen_url VARCHAR(255);
