-- Numeracion visible de OF y OT igual a la del sistema anterior.
--
-- En el legacy el numero que veia la gente (papeles, planos, "OF3001-...")
-- era calculado: OF = id_of + 3000 y OT = id_ot + 5000 (ver p.ej.
-- COPIA_OF/accion_asignar_ot.php `$OT_real = $OT + 5000` y
-- COPIA_OF/clientes_ot.php `$dad['id_of'] + 3000`).
-- Los imports 030/032 guardaron numero_of=id_of y numero_ot=id_ot "crudos";
-- las relaciones (of_id, ot_id, etapas, imagenes, despiece_ot) se resolvieron
-- bien y van por id, asi que solo hay que corregir el numero visible.
--
-- Rangos antes: OF 1..639, OT 1..2816 -> despues: OF 3001..3639, OT 5001..7816.
-- No hay solapamiento posible con la restriccion UNIQUE (todo +offset > max).
-- Guardas: solo corre si todavia estan en el rango crudo (idempotente).

BEGIN;

UPDATE ingenieria.ordenes_fabricacion
   SET numero_of = numero_of + 3000
 WHERE (SELECT max(numero_of) FROM ingenieria.ordenes_fabricacion) < 3000;

UPDATE ingenieria.ordenes_trabajo
   SET numero_ot = numero_ot + 5000
 WHERE (SELECT max(numero_ot) FROM ingenieria.ordenes_trabajo) < 5000;

COMMIT;
