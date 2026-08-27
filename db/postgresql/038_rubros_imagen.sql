-- =====================================================================
-- ERP Albion - Imagen por rubro (catalogo.rubros)
--
-- La legacy no tiene columna de imagen en rubros_albion, pero el
-- usuario proveyo COPIA_IMG/80x80/ con archivos <id>.jpg (1.jpg..30.jpg)
-- que matchean 1:1 el id_Rubro legacy (= catalogo.rubros.id, preservado
-- tal cual desde 007_fix_rubros.sql). Se agrega imagen_url y se puebla
-- por id -- las fotos ya se copiaron a backend/uploads/rubros/.
-- =====================================================================

ALTER TABLE catalogo.rubros
    ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(255);

UPDATE catalogo.rubros SET imagen_url = '/uploads/rubros/' || id || '.jpg' WHERE id BETWEEN 1 AND 30;
