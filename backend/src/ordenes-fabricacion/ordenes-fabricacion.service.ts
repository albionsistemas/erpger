import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenFabricacionDto } from './dto/create-orden-fabricacion.dto';
import { UpdateOrdenFabricacionDto } from './dto/update-orden-fabricacion.dto';
import { QueryOrdenFabricacionDto } from './dto/query-orden-fabricacion.dto';

function toCreateData(dto: CreateOrdenFabricacionDto): Prisma.OrdenFabricacionUncheckedCreateInput {
    const { clienteId, vendedorId, ...rest } = dto;
    return {
        ...rest,
        clienteId: clienteId !== undefined ? BigInt(clienteId) : undefined,
        vendedorId: vendedorId !== undefined ? BigInt(vendedorId) : undefined,
    };
}

function toUpdateData(dto: UpdateOrdenFabricacionDto): Prisma.OrdenFabricacionUncheckedUpdateInput {
    const { clienteId, vendedorId, ...rest } = dto;
    return {
        ...rest,
        clienteId: clienteId !== undefined ? BigInt(clienteId) : undefined,
        vendedorId: vendedorId !== undefined ? BigInt(vendedorId) : undefined,
    };
}

@Injectable()
export class OrdenesFabricacionService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryOrdenFabricacionDto) {
        const where: Prisma.OrdenFabricacionWhereInput = {
            ...(query.clienteId !== undefined ? { clienteId: BigInt(query.clienteId) } : {}),
            ...(query.estadoId !== undefined ? { estadoId: query.estadoId } : {}),
            ...(query.tipoOrdenId !== undefined ? { tipoOrdenId: query.tipoOrdenId } : {}),
            ...(query.fechaDesde || query.fechaHasta
                ? {
                      fecha: {
                          ...(query.fechaDesde ? { gte: new Date(query.fechaDesde) } : {}),
                          ...(query.fechaHasta ? { lte: new Date(query.fechaHasta) } : {}),
                      },
                  }
                : {}),
            ...(query.buscar
                ? {
                      OR: [
                          { referencia: { contains: query.buscar, mode: 'insensitive' } },
                          { nota: { contains: query.buscar, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.ordenFabricacion.findMany({
                where,
                include: {
                    tipoOrden: true,
                    estado: true,
                    cliente: true,
                    _count: { select: { ordenesTrabajo: true } },
                },
                orderBy: { fecha: 'desc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.ordenFabricacion.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const of = await this.prisma.ordenFabricacion.findUnique({
            where: { id },
            include: {
                tipoOrden: true,
                estado: true,
                cliente: true,
                rubro: true,
                vendedor: true,
                ordenesTrabajo: {
                    include: { estado: true, maquina: true },
                    orderBy: { numeroOt: 'asc' },
                },
            },
        });
        if (!of) throw new NotFoundException(`Orden de Fabricacion ${id} no encontrada`);
        return of;
    }

    create(dto: CreateOrdenFabricacionDto) {
        return this.prisma.ordenFabricacion.create({ data: toCreateData(dto) });
    }

    async update(id: bigint, dto: UpdateOrdenFabricacionDto) {
        await this.findOne(id);
        return this.prisma.ordenFabricacion.update({ where: { id }, data: toUpdateData(dto) });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.ordenFabricacion.delete({ where: { id } });
    }
}
