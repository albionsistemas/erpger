-- =====================================================================
-- ERP Albion - Corrige catalogo.rubros con la lista real del legacy
--
-- catalogo.rubros tenia 3 filas cargadas a mano durante pruebas
-- (id 1='Ciruelas Deshidratadas', 2='Nueces', 3='Pasas de Uva') que NO
-- corresponden al legacy `rubros_albion` (30 filas: Aceitunas, Alcaparras,
-- Ajos... con id 1=Aceitunas, no Ciruelas). Se detecto al confirmar que
-- articulos.rubro (legacy) SI referencia rubros_albion -- los valores
-- reales de articulos.rubro (3,6,7,8,9,11,12,13,17,23,30) calzan exacto
-- con esa lista.
--
-- La fila demo OF 3001 (ingenieria.ordenes_fabricacion id=1) tenia
-- rubro_id=1 apuntando a la fila de prueba -- se repunta a 8 (Ciruelas
-- Secas), el equivalente real mas cercano a lo que decia el dato de
-- prueba, antes de reemplazar el catalogo.
-- =====================================================================

UPDATE ingenieria.ordenes_fabricacion SET rubro_id = NULL WHERE rubro_id IS NOT NULL;

DELETE FROM catalogo.rubros;

INSERT INTO catalogo.rubros (id, nombre) VALUES
    (1, 'Aceitunas'),
    (2, 'Alcaparras'),
    (3, 'Ajos'),
    (4, 'Almendras'),
    (5, 'Aromaticas'),
    (6, 'Cebollas'),
    (7, 'Cerezas'),
    (8, 'Ciruelas Secas'),
    (9, 'Ciruelas Frescas'),
    (10, 'Duraznos'),
    (11, 'Nueces'),
    (12, 'Papas'),
    (13, 'Pasas de Uva'),
    (14, 'Pimenton'),
    (15, 'Tomates Frescos'),
    (16, 'Kiwi'),
    (17, 'Zanahorias'),
    (18, 'Pulpas de Fruta'),
    (19, 'Jojoba'),
    (20, 'Tomates Secos'),
    (21, 'Vainas Algarroba'),
    (22, 'Conservas'),
    (23, 'Manzanas'),
    (24, 'Zapallos Anco'),
    (25, 'Zapallo Ingles'),
    (26, 'Avellanas'),
    (27, 'Batata'),
    (28, 'Uva en Fresco'),
    (29, 'Oregano'),
    (30, 'Otros');
SELECT setval(pg_get_serial_sequence('catalogo.rubros', 'id'), (SELECT MAX(id) FROM catalogo.rubros));

UPDATE ingenieria.ordenes_fabricacion SET rubro_id = 8 WHERE id = 1;
