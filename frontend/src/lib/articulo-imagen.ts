// legacy: cuando un articulo no tiene imagen propia, se muestra la
// imagen de su subcategoria (AgrupacionNivel2) en su lugar. Mismo
// criterio aca, en todo lugar donde se muestra la foto de un articulo.
export function imagenArticulo(articulo: { imagenUrl: string | null; subcategoria?: { imagenUrl: string | null } | null }): string | null {
  return articulo.imagenUrl ?? articulo.subcategoria?.imagenUrl ?? null
}
