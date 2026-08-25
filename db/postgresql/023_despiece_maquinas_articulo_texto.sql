-- =====================================================================
-- ERP Albion - Texto libre de articulo en despiece de maquinas (Ingenieria)
--
-- legacy: despiecemaquinas.ARTICULO (varchar 255, NOT NULL). Es la
-- descripcion libre del material, independiente de CODN/articulo_id:
-- el formulario legacy (ajax_form_agregar.php) tiene un autocompletar
-- que, al elegir un articulo real, llena por atras el CODN oculto,
-- pero el textarea de ARTICULO queda editable igual y no se
-- resincroniza. Por eso en la practica hay lineas donde CODN no
-- matchea ningun articulo real (el legacy las marca en rojo en
-- ind-despieces.php) y ARTICULO es la unica descripcion disponible.
--
-- Se habia decidido descartar este campo por "redundante" al migrar
-- articulo_id (ver etl/src/steps/09_despiece.js) -- decision revisada
-- al revisar las pantallas legacy en detalle: no es redundante, hace
-- falta conservarlo. Pendiente actualizar el ETL cuando se corra para
-- despiece_maquinas.
--
-- Solo se agrega a despiece_maquinas por ahora; despiece_ensambles y
-- despiece_ot se deciden aparte.
-- =====================================================================

ALTER TABLE ingenieria.despiece_maquinas
    ADD COLUMN articulo_texto VARCHAR(255);
