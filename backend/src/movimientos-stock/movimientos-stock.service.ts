import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TipoMovimientoStock } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimientoStockDto } from './dto/create-movimiento-stock.dto';
import { QueryMovimientoStockDto } from './dto/query-movimiento-stock.dto';

const CON_DETALLE = {
    include: {
        deposito: true,
        depositoDestino: true,
        articulo: { select: { id: true, nombre: true, modoVenta: true } },
        motivo: true,
        usuario: { select: { id: true, username: true, nombre: true } },
    },
} as const;

@Injectable()
export class MovimientosStockService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryMovimientoStockDto) {
        const where: Prisma.MovimientoStockWhereInput = {
            ...(query.depositoId !== undefined ? { depositoId: BigInt(query.depositoId) } : {}),
            ...(query.articuloId !== undefined ? { articuloId: BigInt(query.articuloId) } : {}),
            ...(query.tipo !== undefined ? { tipo: query.tipo } : {}),
            ...(query.desde || query.hasta
                ? {
                      fecha: {
                          ...(query.desde ? { gte: new Date(query.desde) } : {}),
                          ...(query.hasta ? { lte: new Date(query.hasta) } : {}),
                      },
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.movimientoStock.findMany({
                where,
                ...CON_DETALLE,
                orderBy: { fecha: 'desc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.movimientoStock.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    // Registra el movimiento y actualiza inventario.existencias en la
    // misma transaccion. El ledger es inmutable: no hay update/remove --
    // para corregir un error se postea un movimiento nuevo (ej. un
    // ajuste), nunca se edita/borra el historico.
    async create(dto: CreateMovimientoStockDto, usuarioId?: bigint) {
        const depositoId = BigInt(dto.depositoId);
        const articuloId = BigInt(dto.articuloId);
        const depositoDestinoId = dto.depositoDestinoId !== undefined ? BigInt(dto.depositoDestinoId) : undefined;
        const cantidad = new Prisma.Decimal(dto.cantidad);

        if (dto.tipo === TipoMovimientoStock.TRANSFERENCIA) {
            if (!depositoDestinoId) {
                throw new BadRequestException('Una transferencia necesita deposito de destino');
            }
            if (depositoDestinoId === depositoId) {
                throw new BadRequestException('El deposito de destino tiene que ser distinto al de origen');
            }
        }

        const [deposito, articulo] = await Promise.all([
            this.prisma.deposito.findUnique({ where: { id: depositoId } }),
            this.prisma.articulo.findUnique({ where: { id: articuloId } }),
        ]);
        if (!deposito) throw new NotFoundException(`Deposito ${dto.depositoId} no encontrado`);
        if (!articulo) throw new NotFoundException(`Articulo ${dto.articuloId} no encontrado`);
        if (depositoDestinoId) {
            const destino = await this.prisma.deposito.findUnique({ where: { id: depositoDestinoId } });
            if (!destino) throw new NotFoundException(`Deposito destino ${dto.depositoDestinoId} no encontrado`);
        }

        return this.prisma.$transaction(async (tx) => {
            const movimiento = await tx.movimientoStock.create({
                data: {
                    depositoId,
                    depositoDestinoId,
                    articuloId,
                    tipo: dto.tipo,
                    cantidad,
                    motivoId: dto.motivoId,
                    referencia: dto.referencia,
                    nota: dto.nota,
                    usuarioId,
                },
                ...CON_DETALLE,
            });

            if (dto.tipo === TipoMovimientoStock.ENTRADA) {
                await this.aplicarDelta(tx, depositoId, articuloId, cantidad);
            } else if (dto.tipo === TipoMovimientoStock.SALIDA) {
                await this.aplicarDelta(tx, depositoId, articuloId, cantidad.negated());
            } else {
                await this.aplicarDelta(tx, depositoId, articuloId, cantidad.negated());
                await this.aplicarDelta(tx, depositoDestinoId!, articuloId, cantidad);
            }

            return movimiento;
        });
    }

    private async aplicarDelta(
        tx: Prisma.TransactionClient,
        depositoId: bigint,
        articuloId: bigint,
        delta: Prisma.Decimal,
    ) {
        const actual = await tx.existencia.findUnique({
            where: { depositoId_articuloId: { depositoId, articuloId } },
        });
        const nuevaCantidad = (actual?.cantidad ?? new Prisma.Decimal(0)).add(delta);
        if (nuevaCantidad.isNegative()) {
            throw new BadRequestException(
                `Stock insuficiente en el deposito: quedarian ${nuevaCantidad.toString()} unidades`,
            );
        }
        await tx.existencia.upsert({
            where: { depositoId_articuloId: { depositoId, articuloId } },
            create: { depositoId, articuloId, cantidad: nuevaCantidad },
            update: { cantidad: nuevaCantidad },
        });
    }
}
