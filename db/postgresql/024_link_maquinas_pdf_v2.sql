-- =====================================================================
-- ERP Albion - Vincula PDF de maquinas, carpeta correcta (Ingenieria)
--
-- 019_link_maquinas_pdf.sql uso la carpeta COPIA_IMG/pdf/, que resulto
-- ser mayormente de Articulos (ver 020_link_articulos_pdf.sql) -- solo
-- 3 matches reales de maquinas salieron de ahi. El usuario encontro y
-- copio la carpeta correcta: COPIA_IMG/pdf_planos/ (329 archivos,
-- tambien con nombre corto Windows 8.3 tipo "504M96~S.PDF").
--
-- Matching: a diferencia de los DXF (zip con nombre interno legible),
-- un PDF no tiene "nombre interno" de archivo, pero la mayoria fueron
-- generados por un CAD que graba la ruta/nombre original del dibujo en
-- la metadata /Title del PDF (ej. "X:\INGENIERIA\MAQUINAS
-- CODIFICADAS\503_ELEVADORES\503_10 ELEVADOR BG 200x3500\503_10.R01
-- Model (1)"). Se extrajo /Title de los 329 PDF (168 lo tenian legible,
-- el resto no tiene metadata util -- "Documento1" o vacio, descartados)
-- y se probaron varios tokens de esa ruta (segmento de carpeta,
-- primera palabra, texto despues de un guion) contra maquinas.plano_id
-- exacto: 117 matches, correspondientes a 45 maquinas distintas
-- (varias copias/revisiones del mismo plano). Se eligio la copia con
-- el titulo mas descriptivo (ruta completa) por maquina.
--
-- 2 de estas 45 pisan un match previo de 019 (ids 945 y 1822): esta
-- carpeta es la fuente correcta con metadata rica, se prioriza sobre
-- el match anterior (que era solo coincidencia de nombre numerico
-- contra la carpeta equivocada).
--
-- Los archivos elegidos ya se copiaron a backend/uploads/maquinas-pdf/
-- (script puntual, no versionado).
-- =====================================================================

UPDATE ingenieria.maquinas AS m
SET pdf_url = v.url
FROM (VALUES
    (704, '/uploads/maquinas-pdf/50815.pdf'),
    (792, '/uploads/maquinas-pdf/50819.pdf'),
    (837, '/uploads/maquinas-pdf/507_00.pdf'),
    (838, '/uploads/maquinas-pdf/506_00.pdf'),
    (839, '/uploads/maquinas-pdf/507_03.pdf'),
    (840, '/uploads/maquinas-pdf/506_01.pdf'),
    (841, '/uploads/maquinas-pdf/507_02.pdf'),
    (842, '/uploads/maquinas-pdf/503_01.pdf'),
    (845, '/uploads/maquinas-pdf/506_04.pdf'),
    (849, '/uploads/maquinas-pdf/503_03.pdf'),
    (851, '/uploads/maquinas-pdf/506_02.pdf'),
    (852, '/uploads/maquinas-pdf/506_03.pdf'),
    (853, '/uploads/maquinas-pdf/535_00.pdf'),
    (854, '/uploads/maquinas-pdf/506_05.pdf'),
    (857, '/uploads/maquinas-pdf/512_00.pdf'),
    (858, '/uploads/maquinas-pdf/506_06.pdf'),
    (859, '/uploads/maquinas-pdf/537_00.pdf'),
    (860, '/uploads/maquinas-pdf/502_01.pdf'),
    (861, '/uploads/maquinas-pdf/507_05.pdf'),
    (862, '/uploads/maquinas-pdf/502_00.pdf'),
    (867, '/uploads/maquinas-pdf/536_00.pdf'),
    (871, '/uploads/maquinas-pdf/501_00.pdf'),
    (883, '/uploads/maquinas-pdf/507_04.pdf'),
    (884, '/uploads/maquinas-pdf/522_01.pdf'),
    (945, '/uploads/maquinas-pdf/507_06.pdf'),
    (991, '/uploads/maquinas-pdf/503_10.pdf'),
    (1024, '/uploads/maquinas-pdf/501_04.pdf'),
    (1027, '/uploads/maquinas-pdf/503_00.pdf'),
    (1035, '/uploads/maquinas-pdf/503_14.pdf'),
    (1036, '/uploads/maquinas-pdf/502_11.pdf'),
    (1037, '/uploads/maquinas-pdf/540_02.pdf'),
    (1038, '/uploads/maquinas-pdf/503_15.pdf'),
    (1039, '/uploads/maquinas-pdf/503_13.pdf'),
    (1107, '/uploads/maquinas-pdf/535_01.pdf'),
    (1153, '/uploads/maquinas-pdf/502_21.pdf'),
    (1334, '/uploads/maquinas-pdf/507_12.pdf'),
    (1790, '/uploads/maquinas-pdf/60118.pdf'),
    (1822, '/uploads/maquinas-pdf/50201.pdf'),
    (1875, '/uploads/maquinas-pdf/503_96.pdf'),
    (1876, '/uploads/maquinas-pdf/536_00.r01.pdf'),
    (1878, '/uploads/maquinas-pdf/536_04.pdf'),
    (1885, '/uploads/maquinas-pdf/536_04.v01.pdf'),
    (1890, '/uploads/maquinas-pdf/536_05.pdf'),
    (1891, '/uploads/maquinas-pdf/536_05.v01.pdf'),
    (1895, '/uploads/maquinas-pdf/501_08.pdf')) AS v(id, url)
WHERE m.id = v.id;
