-- =====================================================================
-- Modulo Ajustes: datos fiscales/contacto, banco y logo por empresa
--
-- Contexto: core.empresas se creo (003_empresas.sql) como un seam
-- minimo de multi-tenancy para Auth, pensado para un unico tenant. En
-- la practica Albion compra/vende a la vez desde/hacia 2 o 3 empresas o
-- firmas distintas, y esos datos (CUIT, direccion, banco, logo) hacen
-- falta para membretes/pie de pagina en los documentos que imprime el
-- sistema (cotizaciones, ordenes, etc.). Se amplia la misma tabla en
-- vez de crear un concepto nuevo.
--
-- Se importan las 6 filas reales de la legacy `empresa` (backup
-- 2013, aunque la tabla se siguio usando hasta 2025 -- ver columna
-- `fecha`). La fila existente id=1 "Albion S.A." (creada por
-- seed-superadmin.js, referenciada por usuarios.empresa_id) se
-- UPDATEa en vez de duplicarse. El logo de cada una viene de
-- COPIA_IMG/empresas/ (copiado a mano a backend/uploads/empresas/,
-- mismo esquema que subcategorias/articulos/maquinas).
--
-- OJO: la legacy tiene 2 filas para "F.M.A. COMPANY S.A.S." (mismo
-- NIT, id legacy 0 y 4) -- la id=0 con fecha 2018 y active=0, la id=4
-- con fecha 2022 y active=1 (con datos bancarios completos). Se
-- importan las DOS tal cual estan en el legacy, sin fusionarlas ni
-- descartar la vieja -- que el usuario decida si borra el duplicado
-- desde la UI de Ajustes.
-- =====================================================================

ALTER TABLE core.empresas
    ADD COLUMN IF NOT EXISTS cuit VARCHAR(20),
    ADD COLUMN IF NOT EXISTS direccion VARCHAR(255),
    ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100),
    ADD COLUMN IF NOT EXISTS pais VARCHAR(60),
    ADD COLUMN IF NOT EXISTS telefono VARCHAR(50),
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS web VARCHAR(255),
    ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS banco_nombre VARCHAR(60),
    ADD COLUMN IF NOT EXISTS banco_cuenta VARCHAR(40),
    ADD COLUMN IF NOT EXISTS banco_sucursal VARCHAR(40),
    ADD COLUMN IF NOT EXISTS banco_cbu VARCHAR(40),
    ADD COLUMN IF NOT EXISTS banco_alias VARCHAR(150);

INSERT INTO core.modulos (clave, nombre) VALUES
    ('ajustes', 'Ajustes')
ON CONFLICT (clave) DO NOTHING;

-- id=1 ya existe (seed-superadmin.js) -- se completa con los datos
-- reales de la legacy "ALBION S.A." (legacy id=1) en vez de duplicar.
UPDATE core.empresas SET
    nombre = 'ALBION S.A.',
    activa = false,
    cuit = '30-70741853-9',
    direccion = 'Independencia 516, G. Cruz',
    ciudad = 'Godoy Cruz, Mendoza',
    pais = 'Argentina',
    telefono = '+54 261 4326200',
    email = 'albion@albion.com.ar',
    web = 'www.albion.com.ar',
    logo_url = '/uploads/empresas/330x150_albion.jpg'
WHERE id = 1;

INSERT INTO core.empresas
    (nombre, activa, cuit, direccion, ciudad, pais, telefono, email, web, logo_url,
     banco_nombre, banco_cuenta, banco_sucursal, banco_cbu, banco_alias)
VALUES
    ('F.M.A. COMPANY S.A.S.', false, '30-71616917-7', 'Independencia 516, G. Cruz', 'Godoy Cruz, Mendoza', 'Argentina',
     '+54 261 4326200', 'albion@albion.com.ar', 'www.albion.com.ar', '/uploads/empresas/330x150_fma.jpg',
     'BANCO CREDICOOP', '146463', '116', '1910116555011601464632', 'PORTON.COPA.CLARA'),
    ('ALBION LATINOAMERICANA S.A.', false, '30-70851796-4', 'Independencia 516, G. Cruz', 'Mendoza', 'Argentina',
     '+54 261 4326200', 'albion@albion.com.ar', 'www.albion.com.ar', '/uploads/empresas/330x150_latino.jpg',
     'CREDICOOP', '191-116-040400/6', NULL, '19101165 55011604040064', NULL),
    ('ALBION CHILE SPA', true, '76.361.911-7', 'Nueva Providencia 2155 - Of 604 Torre A', 'Santiago', 'Chile',
     '+56 941323509', 'ventas@albion.cl', 'www.albion.cl', '/uploads/empresas/330x150_spa.jpg',
     NULL, '1622554907', NULL, NULL, NULL),
    ('F.M.A. COMPANY S.A.S.', true, '30-71616917-7', 'Independencia 516, G. Cruz', 'Godoy Cruz, Mendoza', 'Argentina',
     '+54 261 4326200', 'albion@albion.com.ar', 'www.albion.com.ar', '/uploads/empresas/330x150_fma.jpg',
     'CREDICOOP', '146463', '116', '1910116555011601464632', 'PORTON.COPA.CLARA'),
    ('NUTS EQUIPMENT S. A. S.', true, '30-71864150-7', 'Independencia 516, Godoy Cruz', 'Mendoza', 'Argentina',
     '+54 261 4326200', 'albion@albion.com.ar', 'albion.com.ar', '/uploads/empresas/330x150_albion.jpg',
     'GALICIA', '0007251-5 225-1', NULL, '0070225820000007251511', 'NUTSEQUIPMENT');
