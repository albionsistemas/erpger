-- =====================================================================
-- ERP Albion - Revierte nomenclador en maquinas
--
-- Se habia agregado en un archivo 013 (borrado, nunca commiteado) con
-- el mismo criterio que catalogo.articulos.nc, pero el usuario decidio
-- que tampoco se migra para maquinas (0.7% de uso, 11/1618).
-- =====================================================================

ALTER TABLE ingenieria.maquinas
    DROP COLUMN IF EXISTS nomenclador;
