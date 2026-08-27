-- =====================================================================
-- ot_etapas: agrega granularidad de porcentaje de avance
--
-- La legacy o_trabajo trackea cada sector (ING/CORTE/PLEG/FABRIC/MECA/
-- PINT/ARMA) con valores 'C' (completo), 'P' (pendiente), "NN%" (avance
-- parcial real, confirmado en produccion: 10%..95%) ademas de blancos.
-- El modelo actual solo tenia `completada` boolean, insuficiente para
-- representar el avance parcial real. `completada` se mantiene (queda
-- derivado de porcentaje >= 100) para no romper el toggle existente en
-- el tab de Etapas.
-- =====================================================================

ALTER TABLE ingenieria.ot_etapas
    ADD COLUMN IF NOT EXISTS porcentaje SMALLINT;

COMMENT ON COLUMN ingenieria.ot_etapas.porcentaje IS
    'Avance 0-100. NULL = sin dato historico. completada = (porcentaje >= 100).';
