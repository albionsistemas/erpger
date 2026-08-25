// Helpers que replican, campo a campo, el filtrado especial de cada
// pestana del legacy (ind-despieces.php / ind-lista-corte.php /
// ind-lista-compras.php / ind-lista-pantografo.php / ind-lista-chapas.php).
// Se mantienen las listas de palabras e inconsistencias tal cual estaban
// en el legacy (ej: "Cortes de materiales" excluye "delrin" Y "delree",
// pero "Cortes para mecanizado" solo excluye "delree") porque el usuario
// pidio explicitamente respetar el filtrado original.
//
// Diferencia deliberada: el legacy usa INNER JOIN contra articulos en
// varias de estas vistas, así que las lineas sin codigo matcheado
// desaparecen en silencio. Aca se siguen mostrando (con el texto libre),
// para no esconderle a Compras algo que hay que comprar.

export interface DespieceLinea {
  id: number
  item: number
  plano: string | null
  piezaCodigo: string | null
  denominacion: string | null
  articuloId: number | null
  articuloTexto: string | null
  anchoMm: number | null
  largoMm: number | null
  cantidad: number
  tipoCorte: string | null
  nota: string | null
  esChapa: boolean | null
  cantidadComprar: number | null
  metrosLargoTotal: number | null
  metrosCantidadTotal: number | null
  barrasCantidad: number | null
  observacionesCorte: string | null
  esRepuesto: boolean | null
  verificaStock: boolean | null
  articulo: { id: number; nombre: string; imagenUrl: string | null } | null
}

export interface Grupo {
  clave: string
  articuloId: number | null
  nombre: string
  cantidad: number
  nota: string | null
  metrosLargoTotal: number | null
  multiplicacion: number
}

function texto(l: DespieceLinea): string {
  return (l.articuloTexto ?? '').toLowerCase()
}
function contains(l: DespieceLinea, words: string[]): boolean {
  const t = texto(l)
  return words.some((w) => t.includes(w))
}
function startsWith(l: DespieceLinea, prefix: string): boolean {
  return texto(l).startsWith(prefix)
}
export function pareceChapa(l: DespieceLinea): boolean {
  return contains(l, ['chapa'])
}
function pareceRpfvOPlancha(l: DespieceLinea): boolean {
  return contains(l, ['rpfv', 'plancha'])
}

// --- CORTE ---
const PALABRAS_MATERIAL_1 = ['varilla', 'delrin', 'delree', 'polipropileno', 'bronce', 'chapa', 'nylon']
const PALABRAS_MECANIZADO = ['varilla', 'delree', 'polipropileno', 'bronce', 'chapa', 'nylon'] // legacy: sin "delrin" aca (inconsistencia original)

export function cortesDeMateriales(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter(
    (l) =>
      ['m', 'gal', 'tt'].includes(l.tipoCorte ?? '') &&
      !(l.denominacion ?? '').toLowerCase().includes('aprovechamiento') &&
      !contains(l, PALABRAS_MATERIAL_1),
  )
}
export function otrosMateriales(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter((l) => ['mec', 'm'].includes(l.tipoCorte ?? '') && contains(l, PALABRAS_MATERIAL_1))
}
export function cortesParaMecanizado(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter((l) => l.tipoCorte === 'mec' && !contains(l, PALABRAS_MECANIZADO))
}

// --- COMPRAS ---
const PALABRAS_BANDAS = ['banda', 'cadena', 'piaz', 'rpfv']

export function compraComerciales(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter((l) => l.tipoCorte === 'c' && !contains(l, PALABRAS_BANDAS) && !startsWith(l, 'manguera'))
}
export function piezasComunes(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter((l) => l.tipoCorte === 'p/c' && !startsWith(l, 'manguera'))
}
export function bandasPiazMangueras(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter((l) => l.tipoCorte === 'c' && (contains(l, PALABRAS_BANDAS) || startsWith(l, 'manguera')))
}
export function compraBuloneria(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter((l) => l.tipoCorte === 'b')
}
export function compraMaterial(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter((l) => ['m', 'mec'].includes(l.tipoCorte ?? '') && !contains(l, ['chapa']))
}

// --- PANTOGRAFO ---
export function pantografo(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter((l) => ['pant', 'wj'].includes(l.tipoCorte ?? ''))
}

// --- CHAPAS ---
export function chapasDetalle(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter(pareceChapa)
}
export function chapasTotal(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter((l) => pareceChapa(l) && ['c/s', 'm', 'mec', 'c/p', 'pant', 'wj'].includes(l.tipoCorte ?? ''))
}
export function rpfvDetalle(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter(pareceRpfvOPlancha)
}
export function rpfvTotal(lineas: DespieceLinea[]): DespieceLinea[] {
  return lineas.filter((l) => pareceRpfvOPlancha(l) && ['c/s', 'm', 'mec', 'c/p'].includes(l.tipoCorte ?? ''))
}

// --- Agrupacion (Compras/Chapas: agrupa por articulo, suma cantidad
// y un "factor" para el calculo de compra segun corresponda) ---
export function agrupar(lineas: DespieceLinea[], factor: (l: DespieceLinea) => number): Grupo[] {
  const mapa = new Map<string, Grupo>()
  for (const l of lineas) {
    const clave = l.articuloId ? `a-${l.articuloId}` : `t-${l.articuloTexto ?? l.denominacion ?? l.id}`
    const nombre = l.articulo?.nombre ?? l.articuloTexto ?? l.denominacion ?? '(sin nombre)'
    const existente = mapa.get(clave)
    if (existente) {
      existente.cantidad += l.cantidad
      existente.multiplicacion += factor(l)
      existente.metrosLargoTotal ??= l.metrosLargoTotal
      existente.nota ??= l.nota
    } else {
      mapa.set(clave, {
        clave,
        articuloId: l.articuloId,
        nombre,
        cantidad: l.cantidad,
        nota: l.nota,
        metrosLargoTotal: l.metrosLargoTotal,
        multiplicacion: factor(l),
      })
    }
  }
  return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export const factorLineal = (l: DespieceLinea) => (l.largoMm ?? 0) * l.cantidad
export const factorArea = (l: DespieceLinea) => (l.anchoMm ?? 0) * (l.largoMm ?? 0) * l.cantidad

export interface CalculoCompra {
  division: number
  totalComprar: number
  efectividad: number
}
export function calcularCompra(g: Grupo): CalculoCompra | null {
  if (!g.metrosLargoTotal || g.metrosLargoTotal <= 0) return null
  const division = Math.ceil(g.multiplicacion / g.metrosLargoTotal)
  const totalComprar = g.metrosLargoTotal * division
  if (totalComprar <= 0) return null
  const efectividad = Math.round((g.multiplicacion * 100) / totalComprar)
  return { division, totalComprar, efectividad }
}
