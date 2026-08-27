-- =====================================================================
-- ERP Albion - Importacion real de ingenieria.operarios
--
-- 86 filas de la tabla legacy `operarios` (backup_desarrollo2013.sql).
-- id preservado directo (PlanificacionCorte/Tarea lo van a necesitar
-- cuando se importen `planifica`/`tareas`, mismo criterio que otras
-- tablas: preservar el id legacy facilita esas importaciones futuras).
--
-- sector_id: legacy `sector` es texto libre (MECANIZADO/PRODUCCION/
-- VARIOS/ARMADO/INGENIERIA/PINTURA/AJUSTE/CORTE/ALMACEN, o vacio) --
-- matchea EXACTO contra los 12 sectores_produccion ya sembrados, sin
-- necesidad de mapeo manual. Vacio -> NULL.
--
-- imagen_url: legacy `imagen` es el nombre de archivo real ("39.jpg")
-- cuando existe foto, o solo el id sin extension / vacio cuando no hay
-- foto real cargada en el sistema viejo (ej. "69", ""). 40 filas
-- referencian una foto real; 39 de esas se verificaron existentes en
-- COPIA_IMG/operarios_img (provisto por el usuario 2026-08-27) y se
-- copiaron a backend/uploads/operarios/ con el mismo nombre de archivo.
-- Excepcion: id=68 (Collantes Joaquin) referencia '68.jpg' que NO esta
-- en la carpeta provista -- imagen_url queda NULL, no se inventa el
-- archivo. Los ids 87/88 usan nombres de archivo con hash (subidos via
-- el formulario legacy mas nuevo, no el patron <id>.jpg) -- se
-- copiaron igual, referenciados tal cual.
-- =====================================================================

INSERT INTO ingenieria.operarios (id, nombre, sector_id, activo, imagen_url)
VALUES
(1, 'Balmaceda Oscar', 5, true, '/uploads/operarios/1.jpg'),
(2, 'Benegas Hector', 9, false, NULL),
(3, 'Calderon Omar', 9, true, '/uploads/operarios/3.jpg'),
(4, 'Castro Cristian', 12, true, '/uploads/operarios/4.jpg'),
(5, 'Chacon Esteban', 9, true, '/uploads/operarios/5.jpg'),
(6, 'Daniel Bizzotto', NULL, false, NULL),
(7, 'Daniel Guajardo', NULL, false, NULL),
(8, 'Fernandez Gustavo', NULL, false, NULL),
(9, 'Fernandez Mauricio', NULL, false, NULL),
(10, 'Gandia Jorge', NULL, false, NULL),
(11, 'Ghilardi Oscar Alberto', 12, true, NULL),
(13, 'Guerrero Hector', NULL, false, NULL),
(14, 'Gutierrez Guillermo', NULL, false, NULL),
(15, 'Hidalgo Marcelo', NULL, false, NULL),
(16, 'Linco Jose Armando', 9, true, '/uploads/operarios/16.jpg'),
(17, 'Lobos Damian', NULL, false, NULL),
(18, 'Marcelo Arteaga', NULL, false, NULL),
(19, 'Mercado Cristian', 7, true, '/uploads/operarios/19.jpg'),
(20, 'Molina Walter', 12, true, '/uploads/operarios/20.jpg'),
(21, 'Nunez Mario', NULL, false, NULL),
(22, 'Ortiz Adrian', NULL, false, NULL),
(23, 'Pablo Decimo', 1, true, '/uploads/operarios/23.jpg'),
(24, 'Palma Sergio', NULL, false, NULL),
(25, 'Perez Eduardo', NULL, false, NULL),
(26, 'Quiroga Julio', 7, true, '/uploads/operarios/26.jpg'),
(27, 'Ramos Mauricio', 1, true, '/uploads/operarios/27.jpg'),
(28, 'Rodriguez Juan Hernan', NULL, false, NULL),
(29, 'Salafia Humberto', NULL, false, NULL),
(30, 'Sanchez Matias', NULL, false, NULL),
(31, 'Sierra Jair', 9, false, NULL),
(32, 'Terruli Horacio', NULL, false, NULL),
(33, 'Torres Emanuel', 6, true, '/uploads/operarios/33.jpg'),
(34, 'Veaz Armando', NULL, false, NULL),
(36, 'Orlando Dal Pozzo', 1, true, '/uploads/operarios/36.jpg'),
(37, 'Belvedere German', 12, true, '/uploads/operarios/685ae5bd703d7_1750787517.jpg'),
(38, 'Rodriguez Adolfo', NULL, false, NULL),
(39, 'Calile Juan Pablo', 12, true, '/uploads/operarios/39.jpg'),
(40, 'Gomez Cristian', 5, true, '/uploads/operarios/40.jpg'),
(41, 'Arteaga Marcelo', NULL, false, NULL),
(42, 'Calderon Julian', NULL, false, NULL),
(43, 'Villareal Leonel', NULL, false, NULL),
(44, 'Zeballos Sebastian', NULL, false, NULL),
(45, 'Zeballos Damian', 9, true, '/uploads/operarios/45.jpg'),
(46, 'Alcaraz Esteban', NULL, false, NULL),
(47, 'Quinteros Pablo', 10, true, '/uploads/operarios/47.jpg'),
(48, 'Moyano Andres', NULL, false, NULL),
(49, 'Antunez Adriana', NULL, false, NULL),
(50, 'Castillo Mauricio', NULL, false, NULL),
(51, 'Gonzalez Ruben', 9, true, '/uploads/operarios/51.jpg'),
(52, 'Dante Ortiz', 5, true, '/uploads/operarios/52.jpg'),
(53, 'Marcos Ortiz', 6, true, '/uploads/operarios/53.jpg'),
(54, 'Emanuel Valdivia', NULL, false, NULL),
(55, 'Moyano Jose', NULL, false, NULL),
(56, 'Martin Correa', NULL, false, NULL),
(57, 'Gil Gabriel', 9, true, '/uploads/operarios/57.jpg'),
(58, 'Ibanez Cristian', 9, true, '/uploads/operarios/58.jpg'),
(59, 'Ochoa Juan Pablo', 10, true, '/uploads/operarios/59.jpg'),
(60, 'Vega Sergio', NULL, false, NULL),
(61, 'Villegas Thomas', 9, false, '/uploads/operarios/61.jpg'),
(62, 'Zabala Alexis', 2, true, '/uploads/operarios/62.jpg'),
(63, 'Emanuel Vera', 2, true, '/uploads/operarios/63.jpg'),
(64, 'Agustin Martinez', NULL, false, NULL),
(65, 'Alfaro Jonathan', NULL, false, NULL),
(66, 'Marcos Moreno', NULL, false, NULL),
(67, 'Jorge Ortega', NULL, false, NULL),
(68, 'Collantes Joaquin', 9, false, NULL),
(69, 'Ortega Jorge', NULL, false, NULL),
(70, 'Pelayes Luis', 9, true, '/uploads/operarios/70.jpg'),
(71, 'Romero Rocio', 12, true, '/uploads/operarios/71.jpg'),
(72, 'Talquenca Jorge', 7, true, '/uploads/operarios/72.jpg'),
(73, 'Toro Ariel', 12, true, '/uploads/operarios/73.jpg'),
(74, 'Linco Hernan', 9, false, NULL),
(75, 'Mario Castaneda', 10, true, '/uploads/operarios/75.jpg'),
(76, 'Tomas Mujica', 2, true, '/uploads/operarios/76.jpg'),
(77, 'Alfredo Leonardo Valenzuela', 9, false, NULL),
(78, 'Pelayes Jonathan', 5, true, '/uploads/operarios/78.jpg'),
(79, 'Nievas Gustavo', 5, false, '/uploads/operarios/79.jpg'),
(80, 'Nestor Valenzuela', 9, true, '/uploads/operarios/80.jpg'),
(81, 'Javier Godoy', 9, true, '/uploads/operarios/81.jpg'),
(82, 'David Medina', 11, false, NULL),
(83, 'Alexis Arce', 11, false, NULL),
(84, 'Diego Cruz', 5, false, '/uploads/operarios/84.jpg'),
(85, 'Florencia Bordonaro', 12, true, NULL),
(86, 'Rojo Facundo', 6, true, NULL),
(87, 'Elizondo Matias', 9, true, '/uploads/operarios/6a04def0dab69_1778704112.jpeg'),
(88, 'Javier Romero', 9, false, '/uploads/operarios/698f435d70309_1770996573.jpg');

SELECT setval(pg_get_serial_sequence('ingenieria.operarios', 'id'), (SELECT MAX(id) FROM ingenieria.operarios));
