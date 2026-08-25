import PDFDocument from 'pdfkit';

// Tabla con bordes, ancho de columna fijo y salto de pagina automatico
// -- replica el comportamiento de la clase FPDF custom que usaba el
// legacy (Row()/CheckPageBreak()/NbLines()) para los PDFs de despiece
// (imprimir_lista_general.php y hermanos), pero con pdfkit.
export interface ColumnaPdf {
    ancho: number;
    align?: 'left' | 'center' | 'right';
}

const MARGEN = 12;
const ALTO_FILA_MIN = 5;
const PADDING = 2;

// Los anchos de columna del legacy estaban en mm (FPDF con unidad
// 'mm'); se preserva la misma proporcion convirtiendo a puntos.
export const mm = (n: number) => n * 2.8346;

export class PdfTable {
    private y: number;
    private filaIndex = 0;

    constructor(
        private readonly doc: PDFKit.PDFDocument,
        private readonly columnas: ColumnaPdf[],
        y: number,
    ) {
        this.y = y;
    }

    private anchoTotal(): number {
        return this.columnas.reduce((s, c) => s + c.ancho, 0);
    }

    private alturaFila(valores: string[], fontSize: number): number {
        this.doc.fontSize(fontSize);
        let alto = ALTO_FILA_MIN;
        for (let i = 0; i < this.columnas.length; i++) {
            const h = this.doc.heightOfString(valores[i] ?? '', { width: this.columnas[i].ancho - 2 * PADDING });
            alto = Math.max(alto, h + 2 * PADDING);
        }
        return alto;
    }

    private saltoDePaginaSiHaceFalta(alto: number) {
        const limite = this.doc.page.height - this.doc.page.margins.bottom;
        if (this.y + alto > limite) {
            this.doc.addPage();
            this.y = MARGEN;
        }
    }

    // Fila de encabezado: negrita, fondo blanco, sin alternar color.
    encabezado(valores: string[]) {
        this.dibujarFila(valores, { bold: true, fontSize: 9, fill: null });
        this.filaIndex = 0;
    }

    fila(valores: string[], fontSize = 8) {
        const fill = this.filaIndex % 2 === 0 ? ('#f0f0ff' as const) : null;
        this.dibujarFila(valores, { bold: false, fontSize, fill });
        this.filaIndex++;
    }

    private dibujarFila(valores: string[], opts: { bold: boolean; fontSize: number; fill: string | null }) {
        this.doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts.fontSize);
        const alto = this.alturaFila(valores, opts.fontSize);
        this.saltoDePaginaSiHaceFalta(alto);

        let x = MARGEN;
        for (let i = 0; i < this.columnas.length; i++) {
            const col = this.columnas[i];
            if (opts.fill) {
                this.doc.rect(x, this.y, col.ancho, alto).fill(opts.fill);
                this.doc.fillColor('black');
            }
            this.doc.rect(x, this.y, col.ancho, alto).stroke();
            this.doc.text(valores[i] ?? '', x + PADDING, this.y + PADDING, {
                width: col.ancho - 2 * PADDING,
                align: col.align ?? 'left',
            });
            x += col.ancho;
        }
        this.y += alto;
    }

    espacio(h: number) {
        this.y += h;
    }

    tituloSeccion(texto: string) {
        this.saltoDePaginaSiHaceFalta(16);
        this.doc.font('Helvetica-Bold').fontSize(12).fillColor('black').text(texto, MARGEN, this.y, {
            width: this.anchoTotal(),
            align: 'center',
        });
        this.y += 16;
    }

    getY(): number {
        return this.y;
    }
}

// Encabezado comun a todos los PDFs de despiece: titulo, maquina, plano,
// detalle/tipo de hierro. Devuelve el Y donde puede empezar la tabla.
export function encabezadoMaquina(
    doc: PDFKit.PDFDocument,
    opts: {
        titulo: string;
        maquinaNombre: string;
        planoId: string;
        detalle: string | null;
        tipoHierro: string | null;
    },
): number {
    doc.font('Helvetica-Bold').fontSize(20).text(opts.titulo, MARGEN, 20, { width: doc.page.width - 2 * MARGEN, align: 'center' });
    let y = 50;
    doc.font('Helvetica').fontSize(13);
    doc.text(`PL: `, MARGEN, y, { continued: true }).font('Helvetica-Bold').text(opts.planoId, { continued: true });
    doc.font('Helvetica').text('   MAQUINA: ', { continued: true }).font('Helvetica-Bold').text(opts.maquinaNombre);
    y += 20;
    if (opts.detalle || opts.tipoHierro) {
        doc.font('Helvetica').fontSize(8).text([opts.detalle, opts.tipoHierro].filter(Boolean).join(' :: '), MARGEN, y);
        y += 12;
    }
    return y + 10;
}

export function piePagina(doc: PDFKit.PDFDocument) {
    const paginas = doc.bufferedPageRange();
    const fecha = new Date().toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' });
    for (let i = 0; i < paginas.count; i++) {
        doc.switchToPage(paginas.start + i);
        // Escribir tan cerca del borde inferior dispara el salto de
        // pagina automatico de pdfkit (cree que no entra el texto) --
        // se suspende el margen inferior mientras se dibuja el pie.
        const margenOriginal = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('black')
            .text(`Pagina ${i + 1} de ${paginas.count}   ${fecha}`, MARGEN, doc.page.height - 20, {
                width: doc.page.width - 2 * MARGEN,
                align: 'center',
            });
        doc.page.margins.bottom = margenOriginal;
    }
}

export function crearDocumento(orientacion: 'portrait' | 'landscape'): PDFKit.PDFDocument {
    return new PDFDocument({ size: 'legal', layout: orientacion, margin: MARGEN, bufferPages: true, autoFirstPage: true });
}
