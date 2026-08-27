import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExistenciasService {
    constructor(private readonly prisma: PrismaService) {}

    // Lista cruda (deposito, articulo, cantidad) -- para cuando hace
    // falta filtrar por un deposito puntual en vez del resumen agregado.
    findAll(depositoId?: number, articuloId?: number) {
        const where: Prisma.ExistenciaWhereInput = {
            ...(depositoId !== undefined ? { depositoId: BigInt(depositoId) } : {}),
            ...(articuloId !== undefined ? { articuloId: BigInt(articuloId) } : {}),
        };
        return this.prisma.existencia.findMany({
            where,
            include: { deposito: true, articulo: { select: { id: true, nombre: true, modoVenta: true } } },
            orderBy: [{ articulo: { nombre: 'asc' } }],
        });
    }

    // Resumen por articulo: total sumando todos los depositos + desglose
    // + alerta cuando el total esta por debajo de articulos.stock_minimo
    // (global por articulo, no por deposito -- decision del usuario
    // 2026-08-27). Incluye articulos con stock_minimo cargado aunque
    // todavia no tengan ninguna fila de existencia (= 0 en todos lados,
    // que es justo cuando mas importa que salte la alerta).
    async resumen() {
        const [existencias, articulosConMinimo] = await Promise.all([
            this.prisma.existencia.findMany({
                include: { deposito: { select: { id: true, nombre: true } } },
            }),
            this.prisma.articulo.findMany({
                where: { stockMinimo: { not: null } },
                select: { id: true },
            }),
        ]);

        const porArticulo = new Map<
            string,
            { articuloId: bigint; total: Prisma.Decimal; porDeposito: { depositoId: bigint; depositoNombre: string; cantidad: Prisma.Decimal }[] }
        >();

        for (const e of existencias) {
            const key = e.articuloId.toString();
            if (!porArticulo.has(key)) {
                porArticulo.set(key, { articuloId: e.articuloId, total: new Prisma.Decimal(0), porDeposito: [] });
            }
            const entry = porArticulo.get(key)!;
            entry.total = entry.total.add(e.cantidad);
            entry.porDeposito.push({ depositoId: e.deposito.id, depositoNombre: e.deposito.nombre, cantidad: e.cantidad });
        }
        for (const a of articulosConMinimo) {
            const key = a.id.toString();
            if (!porArticulo.has(key)) {
                porArticulo.set(key, { articuloId: a.id, total: new Prisma.Decimal(0), porDeposito: [] });
            }
        }

        const articuloIds = [...porArticulo.values()].map((v) => v.articuloId);
        const articulos = await this.prisma.articulo.findMany({
            where: { id: { in: articuloIds } },
            select: { id: true, nombre: true, modoVenta: true, stockMinimo: true },
        });
        const articuloById = new Map(articulos.map((a) => [a.id.toString(), a]));

        return [...porArticulo.values()]
            .map((entry) => {
                const articulo = articuloById.get(entry.articuloId.toString());
                const stockMinimo = articulo?.stockMinimo ?? null;
                return {
                    articuloId: entry.articuloId,
                    nombre: articulo?.nombre ?? '(articulo no encontrado)',
                    modoVenta: articulo?.modoVenta ?? null,
                    total: entry.total,
                    stockMinimo,
                    alerta: stockMinimo !== null && entry.total.lessThan(stockMinimo),
                    porDeposito: entry.porDeposito,
                };
            })
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
}
