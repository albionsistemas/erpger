-- =====================================================================
-- ERP Albion - Vincula PDF de maquinas (Ingenieria)
--
-- El usuario copio 2327 archivos a COPIA_IMG/pdf. Matching contra
-- maquinas.plano_id (igual criterio que las imagenes): solo 3/1618
-- calzan. El resto de la carpeta (>2300 archivos, en su mayoria
-- nombres puramente numericos) corresponde a codigo_articulo real de
-- catalogo.articulos, NO a maquinas -- confirmado cruzando una muestra
-- de nombres contra catalogo.articulos.id. Se deja para una migracion
-- aparte si el usuario confirma que quiere vincular PDFs de Articulos.
-- =====================================================================

UPDATE ingenieria.maquinas AS m
SET pdf_url = v.url
FROM (VALUES
    (54, '/uploads/maquinas-pdf/50700.pdf'),
    (945, '/uploads/maquinas-pdf/507_06.pdf'),
    (1822, '/uploads/maquinas-pdf/50201.pdf')
) AS v(id, url)
WHERE m.id = v.id;
