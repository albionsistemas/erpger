import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { crearDocumento, encabezadoMaquina, piePagina, PdfTable, mm } from './pdf-table';
import {
    LineaDespiece,
    lineasGeneral,
    cortesDeMateriales,
    cortesParaMecanizado,
    otrosMateriales,
    compraComerciales,
    piezasComunes,
    bandasPiazMangueras,
    compraBuloneria,
    compraMaterial,
    pantografo,
    chapasTotal,
    rpfvTotal,
    agrupar,
    factorLineal,
    factorArea,
    calcularCompra,
    nombreArticulo,
} from './despiece-filtros';

// Genera, con pdfkit, los mismos 5 PDF que el legacy producia con FPDF
// (imprimir_lista_general.php / _cortes.php / _compras.php /
// _pantografo.php / _chapas.php) -- estilo similar (titulo, tabla con
// bordes y filas alternadas, pie con fecha/pagina), no una copia
// pixel-perfect. Cada metodo devuelve el PDF ya renderizado en Buffer.
@Injectable()
export class DespiecePdfService {
    constructor(private readonly prisma: PrismaService) {}

    private async maquina(plano: string) {
        const maquina = await this.prisma.maquina.findUnique({ where: { planoId: plano } });
        if (!maquina) throw new NotFoundException(`Maquina con plano ${plano} no encontrada`);
        return maquina;
    }

    private async lineas(plano: string): Promise<LineaDespiece[]> {
        return this.prisma.despieceMaquina.findMany({
            where: { plano },
            include: { articulo: true },
            orderBy: { item: 'asc' },
        });
    }

    private async renderizar(
        plano: string,
        titulo: string,
        orientacion: 'portrait' | 'landscape',
        dibujar: (doc: PDFKit.PDFDocument, y: number, todas: LineaDespiece[]) => void,
    ): Promise<Buffer> {
        const [maquina, todas] = await Promise.all([this.maquina(plano), this.lineas(plano)]);
        const doc = crearDocumento(orientacion);
        const chunks: Buffer[] = [];
        doc.on('data', (c: Buffer) => chunks.push(c));
        const fin = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

        const y = encabezadoMaquina(doc, {
            titulo,
            maquinaNombre: maquina.nombre,
            planoId: maquina.planoId,
            detalle: maquina.detalle,
            tipoHierro: maquina.tipoHierro,
        });
        dibujar(doc, y, todas);
        piePagina(doc);
        doc.end();
        return fin;
    }

    // --- GENERAL (boton "Imp sin fotos") ---
    async general(plano: string): Promise<Buffer> {
        return this.renderizar(plano, 'LISTA GENERAL', 'landscape', (doc, y, todas) => {
            const filas = lineasGeneral(todas);
            const tabla = new PdfTable(
                doc,
                [
                    { ancho: mm(18) },
                    { ancho: mm(10), align: 'right' },
                    { ancho: mm(26) },
                    { ancho: mm(43) },
                    { ancho: mm(138) },
                    { ancho: mm(18), align: 'right' },
                    { ancho: mm(18), align: 'right' },
                    { ancho: mm(15), align: 'right' },
                    { ancho: mm(13) },
                    { ancho: mm(30) },
                ],
                y,
            );
            tabla.encabezado(['Cod', 'Item', 'PL', 'Denominacion', 'Articulo', 'Ancho', 'Largo', 'Cant', 'Tipo', 'Nota']);
            for (const l of filas) {
                tabla.fila([
                    l.articuloId?.toString() ?? '-',
                    String(l.item),
                    l.piezaCodigo ?? '',
                    l.denominacion ?? '',
                    nombreArticulo(l),
                    l.anchoMm != null ? String(l.anchoMm) : '',
                    l.largoMm != null ? String(l.largoMm) : '',
                    String(l.cantidad),
                    l.tipoCorte ?? '',
                    l.nota ?? '',
                ]);
            }
        });
    }

    // --- CORTE ---
    async corte(plano: string): Promise<Buffer> {
        return this.renderizar(plano, 'LISTA DE CORTE', 'portrait', (doc, yInicial, todas) => {
            let y = yInicial;
            const anchosPieza = [{ ancho: mm(35) }, { ancho: mm(120) }, { ancho: mm(20), align: 'right' as const }, { ancho: mm(20), align: 'right' as const }];

            const materiales = cortesDeMateriales(todas).sort((a, b) => (a.piezaCodigo ?? '').localeCompare(b.piezaCodigo ?? ''));
            let tabla = new PdfTable(doc, anchosPieza, y);
            tabla.encabezado(['Plano', 'Denominacion', 'Largo', 'Cant']);
            for (const l of materiales) tabla.fila([l.piezaCodigo ?? '', nombreArticulo(l), l.largoMm != null ? String(l.largoMm) : '', String(l.cantidad)]);
            y = tabla.getY() + 14;

            doc.font('Helvetica-Bold').fontSize(13).text('CORTES PARA MECANIZADO', 12, y, { width: doc.page.width - 24, align: 'center' });
            y += 16;
            const mecanizado = cortesParaMecanizado(todas).sort((a, b) => (a.piezaCodigo ?? '').localeCompare(b.piezaCodigo ?? ''));
            tabla = new PdfTable(doc, anchosPieza, y);
            tabla.encabezado(['Plano', 'Denominacion', 'Largo', 'Cant']);
            for (const l of mecanizado) tabla.fila([l.piezaCodigo ?? '', nombreArticulo(l), l.largoMm != null ? String(l.largoMm) : '', String(l.cantidad)]);
            y = tabla.getY() + 14;

            doc.font('Helvetica-Bold').fontSize(13).text('OTROS MATERIALES', 12, y, { width: doc.page.width - 24, align: 'center' });
            y += 16;
            const otros = otrosMateriales(todas).sort((a, b) => (a.articuloTexto ?? '').localeCompare(b.articuloTexto ?? ''));
            tabla = new PdfTable(
                doc,
                [{ ancho: mm(35) }, { ancho: mm(90) }, { ancho: mm(15), align: 'right' }, { ancho: mm(15), align: 'right' }, { ancho: mm(40) }],
                y,
            );
            tabla.encabezado(['Plano', 'Denominacion', 'Largo', 'Cant', 'Nota']);
            for (const l of otros)
                tabla.fila([l.piezaCodigo ?? '', l.articuloTexto ?? l.denominacion ?? '', l.largoMm != null ? String(l.largoMm) : '', String(l.cantidad), l.nota ?? '']);
        });
    }

    // --- COMPRAS ---
    async compras(plano: string): Promise<Buffer> {
        return this.renderizar(plano, 'LISTA DE PEDIDO DE MATERIALES', 'portrait', (doc, yInicial, todas) => {
            let y = yInicial;
            const anchoPag = doc.page.width - 24;

            const comerciales = agrupar(compraComerciales(todas), () => 0);
            let tabla = new PdfTable(doc, [{ ancho: mm(144) }, { ancho: mm(18), align: 'right' }, { ancho: mm(38) }], y);
            tabla.encabezado(['Comercial', 'Cant', 'Nota']);
            for (const g of comerciales) tabla.fila([g.nombre, String(g.cantidad), g.nota ?? '']);
            y = tabla.getY() + 10;

            const piezas = agrupar(piezasComunes(todas), () => 0);
            tabla = new PdfTable(doc, [{ ancho: mm(18), align: 'right' }, { ancho: mm(18) }, { ancho: mm(126) }, { ancho: mm(38) }], y);
            tabla.encabezado(['Cant', 'Cod', 'Pieza comun - Albion', 'Nota']);
            for (const g of piezas) tabla.fila([String(g.cantidad), g.articuloId?.toString() ?? '-', g.nombre, g.nota ?? '']);
            y = tabla.getY() + 10;

            const bandas = bandasPiazMangueras(todas).sort((a, b) => (a.articuloTexto ?? '').localeCompare(b.articuloTexto ?? ''));
            tabla = new PdfTable(doc, [{ ancho: mm(18), align: 'right' }, { ancho: mm(18) }, { ancho: mm(126) }, { ancho: mm(38) }], y);
            tabla.encabezado(['Cant', 'Dim', 'Bandas, mangueras, PIAZ y cadenas', 'Nota']);
            for (const l of bandas)
                tabla.fila([
                    String(l.cantidad),
                    `${l.anchoMm ?? ''} x ${l.largoMm ?? ''}`,
                    l.articuloTexto ?? l.denominacion ?? '',
                    l.nota ?? '',
                ]);
            y = tabla.getY() + 10;

            const buloneria = agrupar(compraBuloneria(todas), () => 0);
            tabla = new PdfTable(doc, [{ ancho: mm(144) }, { ancho: mm(38), align: 'right' }, { ancho: mm(18) }], y);
            tabla.encabezado(['Buloneria', 'Cant', 'Cod']);
            for (const g of buloneria) tabla.fila([g.nombre, String(g.cantidad), 'b']);
            y = tabla.getY() + 10;

            const material = agrupar(compraMaterial(todas), factorLineal);
            doc.font('Helvetica-Bold').fontSize(12).text('Material', 12, y, { width: anchoPag });
            y += 14;
            tabla = new PdfTable(doc, [{ ancho: mm(144) }, { ancho: mm(38), align: 'right' }, { ancho: mm(18), align: 'right' }], y);
            tabla.encabezado(['Material', 'Largo', 'Cant']);
            for (const g of material) {
                const compra = calcularCompra(g);
                tabla.fila([g.nombre, g.metrosLargoTotal != null ? String(g.metrosLargoTotal) : '', compra ? `${compra.division}${g.verificaStock ? ' *' : ''}` : '-']);
            }
            y = tabla.getY() + 10;
            doc.font('Helvetica-Bold').fontSize(9).text('* VER STOCK', 12, y);
        });
    }

    // --- PANTOGRAFO ---
    async pantografo(plano: string): Promise<Buffer> {
        return this.renderizar(plano, 'CORTES EN CNC ROUTER LASER / WJ', 'landscape', (doc, y, todas) => {
            const filas = pantografo(todas);
            const tabla = new PdfTable(
                doc,
                [
                    { ancho: mm(10), align: 'right' },
                    { ancho: mm(30) },
                    { ancho: mm(45) },
                    { ancho: mm(139) },
                    { ancho: mm(18), align: 'right' },
                    { ancho: mm(18), align: 'right' },
                    { ancho: mm(15), align: 'right' },
                    { ancho: mm(13) },
                    { ancho: mm(40) },
                ],
                y,
            );
            tabla.encabezado(['Item', 'PL', 'Denominacion', 'Articulo', 'Ancho', 'Largo', 'Cant', 'Cod', 'Nota']);
            for (const l of filas)
                tabla.fila([
                    String(l.item),
                    l.piezaCodigo ?? '',
                    l.denominacion ?? '',
                    l.articuloTexto ?? nombreArticulo(l),
                    l.anchoMm != null ? String(l.anchoMm) : '',
                    l.largoMm != null ? String(l.largoMm) : '',
                    String(l.cantidad),
                    l.tipoCorte ?? '',
                    l.nota ?? '',
                ]);
        });
    }

    // --- CHAPAS ---
    async chapas(plano: string): Promise<Buffer> {
        return this.renderizar(plano, 'LISTA DE CHAPAS', 'landscape', (doc, yInicial, todas) => {
            let y = yInicial;
            const anchos = [
                { ancho: mm(20) },
                { ancho: mm(195) },
                { ancho: mm(35) },
                { ancho: mm(28), align: 'right' as const },
                { ancho: mm(28), align: 'right' as const },
            ];

            const chapas = agrupar(chapasTotal(todas), factorArea);
            let tabla = new PdfTable(doc, anchos, y);
            tabla.encabezado(['Cod', 'Chapas', 'Recorte', 'V.Stock', 'Cant']);
            for (const g of chapas) {
                const compra = calcularCompra(g);
                tabla.fila([
                    g.articuloId?.toString() ?? '-',
                    g.nombre,
                    g.observacionesCorte ?? '',
                    g.verificaStock ? '*' : '',
                    compra ? String(compra.division) : '-',
                ]);
            }
            y = tabla.getY() + 14;

            doc.font('Helvetica-Bold').fontSize(13).text('OTRAS PLACAS', 12, y, { width: doc.page.width - 24, align: 'center' });
            y += 16;
            const placas = agrupar(rpfvTotal(todas), factorArea);
            tabla = new PdfTable(doc, anchos, y);
            tabla.encabezado(['Cod', 'Otras placas', 'Recorte', 'V.Stock', 'Cant']);
            for (const g of placas) {
                const compra = calcularCompra(g);
                tabla.fila([
                    g.articuloId?.toString() ?? '-',
                    g.nombre,
                    g.observacionesCorte ?? '',
                    g.verificaStock ? '*' : '',
                    compra ? String(compra.division) : '-',
                ]);
            }
        });
    }
}
