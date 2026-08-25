-- =====================================================================
-- Quita el duplicado viejo de F.M.A. COMPANY S.A.S.
--
-- 027_empresas_datos.sql importo, tal cual estaba en la legacy, 2 filas
-- para la misma empresa/CUIT (id legacy 0 de 2018, inactiva, sin datos
-- bancarios; id legacy 4 de 2022, activa, con datos bancarios
-- completos). El usuario confirmo que debe quedar una sola: se borra
-- la vieja/inactiva y se deja la de 2022.
-- =====================================================================

DELETE FROM core.empresas
WHERE nombre = 'F.M.A. COMPANY S.A.S.' AND activa = false AND cuit = '30-71616917-7';
