// Port a backend (para generar los PDF) del filtrado especial de cada
// pestana del legacy, ya portado antes al frontend en
// frontend/src/pages/despiece-maquinas/despiece-helpers.ts. Se duplica
// aca (no se comparte codigo entre paquetes) pero las listas de
// palabras y las inconsistencias originales se mantienen identicas a
// proposito -- ver comentario de cabecera de ese archivo.
import { Prisma } from '@prisma/client';

export type LineaDespiece = Prisma.DespieceMaquinaGetPayload<{ include: { articulo: true } }>;

function texto(l: LineaDespiece): string {
    return (l.articuloTexto ?? '').toLowerCase();
}
function contains(l: LineaDespiece, words: string[]): boolean {
    const t = texto(l);
    return words.some((w) => t.includes(w));
}
function startsWith(l: LineaDespiece, prefix: string): boolean {
    return texto(l).startsWith(prefix);
}
export function pareceChapa(l: LineaDespiece): boolean {
    return contains(l, ['chapa']);
}
function pareceRpfvOPlancha(l: LineaDespiece): boolean {
    return contains(l, ['rpfv', 'plancha']);
}

// --- GENERAL ---
export function lineasGeneral(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => !(l.denominacion ?? '').toLowerCase().includes('aprovechamiento'));
}

// --- CORTE ---
const PALABRAS_MATERIAL_1 = ['varilla', 'delrin', 'delree', 'polipropileno', 'bronce', 'chapa', 'nylon'];
const PALABRAS_MECANIZADO = ['varilla', 'delree', 'polipropileno', 'bronce', 'chapa', 'nylon']; // legacy: sin "delrin" aca (inconsistencia original)

export function cortesDeMateriales(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter(
        (l) =>
            ['m', 'gal', 'tt'].includes(l.tipoCorte ?? '') &&
            !(l.denominacion ?? '').toLowerCase().includes('aprovechamiento') &&
            !contains(l, PALABRAS_MATERIAL_1),
    );
}
export function otrosMateriales(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => ['mec', 'm'].includes(l.tipoCorte ?? '') && contains(l, PALABRAS_MATERIAL_1));
}
export function cortesParaMecanizado(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => l.tipoCorte === 'mec' && !contains(l, PALABRAS_MECANIZADO));
}

// --- COMPRAS ---
const PALABRAS_BANDAS = ['banda', 'cadena', 'piaz', 'rpfv'];

export function compraComerciales(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => l.tipoCorte === 'c' && !contains(l, PALABRAS_BANDAS) && !startsWith(l, 'manguera'));
}
export function piezasComunes(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => l.tipoCorte === 'p/c' && !startsWith(l, 'manguera'));
}
export function bandasPiazMangueras(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => l.tipoCorte === 'c' && (contains(l, PALABRAS_BANDAS) || startsWith(l, 'manguera')));
}
export function compraBuloneria(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => l.tipoCorte === 'b');
}
export function compraMaterial(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => ['m', 'mec'].includes(l.tipoCorte ?? '') && !contains(l, ['chapa']));
}

// --- PANTOGRAFO ---
export function pantografo(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => ['pant', 'wj'].includes(l.tipoCorte ?? ''));
}

// --- CHAPAS ---
export function chapasTotal(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => pareceChapa(l) && ['c/s', 'm', 'mec', 'c/p', 'pant', 'wj'].includes(l.tipoCorte ?? ''));
}
export function rpfvTotal(lineas: LineaDespiece[]): LineaDespiece[] {
    return lineas.filter((l) => pareceRpfvOPlancha(l) && ['c/s', 'm', 'mec', 'c/p'].includes(l.tipoCorte ?? ''));
}

// --- Agrupacion (Compras/Chapas: agrupa por articulo, suma cantidad) ---
export interface GrupoLinea {
    articuloId: bigint | null;
    nombre: string;
    cantidad: number;
    nota: string | null;
    metrosLargoTotal: number | null;
    multiplicacion: number;
    observacionesCorte: string | null;
    verificaStock: boolean;
}
export function agrupar(lineas: LineaDespiece[], factor: (l: LineaDespiece) => number): GrupoLinea[] {
    const mapa = new Map<string, GrupoLinea>();
    for (const l of lineas) {
        const clave = l.articuloId ? `a-${l.articuloId}` : `t-${l.articuloTexto ?? l.denominacion ?? l.id}`;
        const nombre = l.articulo?.nombre ?? l.articuloTexto ?? l.denominacion ?? '(sin nombre)';
        const existente = mapa.get(clave);
        if (existente) {
            existente.cantidad += l.cantidad;
            existente.multiplicacion += factor(l);
            existente.metrosLargoTotal ??= l.metrosLargoTotal;
            existente.nota ??= l.nota;
            existente.observacionesCorte ??= l.observacionesCorte;
            existente.verificaStock ||= !!l.verificaStock;
        } else {
            mapa.set(clave, {
                articuloId: l.articuloId,
                nombre,
                cantidad: l.cantidad,
                nota: l.nota,
                metrosLargoTotal: l.metrosLargoTotal,
                multiplicacion: factor(l),
                observacionesCorte: l.observacionesCorte,
                verificaStock: !!l.verificaStock,
            });
        }
    }
    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export const factorLineal = (l: LineaDespiece) => (l.largoMm ?? 0) * l.cantidad;
export const factorArea = (l: LineaDespiece) => (l.anchoMm ?? 0) * (l.largoMm ?? 0) * l.cantidad;

export function calcularCompra(g: GrupoLinea): { division: number } | null {
    if (!g.metrosLargoTotal || g.metrosLargoTotal <= 0) return null;
    const division = Math.ceil(g.multiplicacion / g.metrosLargoTotal);
    return { division };
}

export function nombreArticulo(l: LineaDespiece): string {
    if (l.articulo) return l.articulo.nombre;
    return `${l.articuloTexto ?? ''} (*)`;
}
