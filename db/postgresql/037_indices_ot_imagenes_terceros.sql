-- =====================================================================
-- ERP Albion - Indices faltantes en ot_imagenes/ot_terceros
--
-- Sus tablas hermanas (tareas, ot_cambios) ya tienen un indice sobre
-- ot_id para el lookup por OT (GET /ordenes-trabajo/:id/imagenes,
-- /terceros). ot_imagenes/ot_terceros no lo tenian -- encontrado en la
-- auditoria general del sistema, 2026-08-27. ot_imagenes ya tiene 5414
-- filas reales (import del mismo dia), asi que el index deja de ser
-- teorico.
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_ot_imagenes_ot ON ingenieria.ot_imagenes (ot_id);
CREATE INDEX IF NOT EXISTS idx_ot_terceros_ot ON ingenieria.ot_terceros (ot_id);
