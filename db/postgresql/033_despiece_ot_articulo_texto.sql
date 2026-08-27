-- =====================================================================
-- ERP Albion - Texto libre de articulo en despiece de OT (Ingenieria)
--
-- Mismo criterio que 023_despiece_maquinas_articulo_texto.sql: legacy
-- despiece_ot.ARTICULO (varchar 255, NOT NULL, siempre presente en las
-- 158736 filas) es la descripcion libre del material usado, independiente
-- de CODN/articulo_id. Aca es especialmente relevante -- no es solo un
-- resabio del formulario legacy: es justamente el registro de que el
-- material REAL usado en una OT puede diferir del articulo nominal
-- (reemplazos por faltante de stock, mejores precios de compatibles,
-- etc. -- confirmado por el usuario 2026-08-27). articulo_id sigue
-- siendo la referencia al catalogo cuando resuelve; articulo_texto
-- preserva siempre lo que realmente se registro.
-- =====================================================================

ALTER TABLE ingenieria.despiece_ot
    ADD COLUMN IF NOT EXISTS articulo_texto VARCHAR(255);
