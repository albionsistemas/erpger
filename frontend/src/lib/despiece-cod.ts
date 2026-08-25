// legacy: campo "Conocido" del formulario de alta de despiece
// (ajax_form_agregar.php) -- 12 valores seleccionables, con nombre
// humano. Ademas se vieron 2 codigos huerfanos en data vieja ("gal",
// "tt") que ya no estan en el formulario legacy: se dejan fuera del
// selector de alta/edicion (no se puede volver a elegirlos), pero el
// filtro de la lista los sigue mostrando si aparecen en datos reales.
export interface TipoCorteOption {
  value: string
  label: string
}

export const TIPOS_CORTE: TipoCorteOption[] = [
  { value: 'c/p', label: 'Corte/Plegado' },
  { value: 'mec', label: 'Mecanizado' },
  { value: 'c/s', label: 'C/S' },
  { value: 'c', label: 'Comercial' },
  { value: 'm', label: 'Material' },
  { value: 'b', label: 'Buloneria' },
  { value: 'pz', label: 'Punzonado' },
  { value: 'wj', label: 'Water Cutter' },
  { value: 'pant', label: 'Pantografo' },
  { value: 'ts', label: 'Tratamiento Superficie' },
  { value: 'rol', label: 'Rolado' },
  { value: 'p/c', label: 'Pieza Comun / Albion' },
]

const TIPO_CORTE_LABEL: Record<string, string> = Object.fromEntries(TIPOS_CORTE.map((t) => [t.value, t.label]))

export function labelTipoCorte(cod: string | null | undefined): string {
  if (!cod) return '-'
  return TIPO_CORTE_LABEL[cod] ?? cod
}
