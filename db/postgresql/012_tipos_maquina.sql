-- =====================================================================
-- ERP Albion - Catalogo real de tipos de maquina (Ingenieria)
--
-- ingenieria.tipos_maquina solo tenia 1 fila de prueba ('CAL'
-- Calibradoras, cargada a mano durante testing, no referenciada por
-- ninguna maquina real -- ver [[project-albion-erp-status]], fixtures
-- de prueba, "fine to delete"). Se reemplaza por las 34 filas reales de
-- `tipomaquinas` del legacy, preservando el id original (porque
-- maquinas.TipodeMaquina lo referencia por numero).
--
-- Se agrega ademas el id 80 = "Servicio y Reparacion", que el legacy
-- usaba en 286 de las 1618 maquinas (17.7%, plano con prefijo "SR_")
-- pero nunca dio de alta en `tipomaquinas` -- confirmado con el usuario
-- que "SR_" = Servicio y Reparacion.
-- =====================================================================

DELETE FROM ingenieria.tipos_maquina;

INSERT INTO ingenieria.tipos_maquina (id, codigo, nombre) VALUES
    (1, NULL, 'PEDIDOS VARIOS'),
    (2, NULL, 'PL1'),
    (3, NULL, 'PL2'),
    (4, NULL, 'PL3'),
    (5, NULL, 'PL500 Hornos'),
    (6, NULL, 'PL501 Lavadoras'),
    (7, NULL, 'PL502 Cintas'),
    (8, NULL, 'PL503 Elevadores'),
    (9, NULL, 'PL504 Tamanadoras'),
    (10, NULL, 'PL505 Abrillantadoras'),
    (11, NULL, 'PL506 Zaranda'),
    (12, NULL, 'PL507 AspiradorVacio'),
    (13, NULL, 'PL508 Tablero de comado'),
    (14, NULL, 'PL509 Cortadoras'),
    (15, NULL, 'PL510 Calibradoras'),
    (16, NULL, 'PL511 Tanques'),
    (17, NULL, 'PL512 Soportes y Transportines'),
    (18, NULL, 'PL517 CargadoraRodillos'),
    (19, NULL, 'PL520 Centrifugas'),
    (20, NULL, 'PL521 Cepilladoras'),
    (21, NULL, 'PL522 Volcadores'),
    (22, NULL, 'PL523 Descartadora'),
    (23, NULL, 'PL527 Tiernizador'),
    (24, NULL, 'PL535 Pesadora'),
    (25, NULL, 'PL536 Pre Lavadora'),
    (26, NULL, 'PL537 Plataformas'),
    (27, NULL, 'PL538 Limpiadoras'),
    (28, NULL, 'PL539 Descarozadora'),
    (29, NULL, 'PL540 Despalillado'),
    (30, NULL, 'PL541 Sin Fines'),
    (31, NULL, 'PL542 Bombas'),
    (32, NULL, 'PL600 Especiales'),
    (33, NULL, 'PL601 PiezasComunes'),
    (34, NULL, 'PL602 Equipos STD'),
    (80, NULL, 'Servicio y Reparacion');
SELECT setval(pg_get_serial_sequence('ingenieria.tipos_maquina', 'id'), (SELECT MAX(id) FROM ingenieria.tipos_maquina));
