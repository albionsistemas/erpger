import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanificacionDto } from './dto/create-planificacion.dto';
import { UpdatePlanificacionDto } from './dto/update-planificacion.dto';
import { QueryPlanificacionDto } from './dto/query-planificacion.dto';
import { AddItemDto } from './dto/add-item.dto';

function toCreateData(dto: CreatePlanificacionDto): Prisma.PlanificacionCorteUncheckedCreateInput {
    const { otId, operarioId, ...rest } = dto;
    return {
        ...rest,
        otId: BigInt(otId),
        operarioId: operarioId !== undefined ? BigInt(operarioId) : undefined,
    };
}

function toUpdateData(dto: UpdatePlanificacionDto): Prisma.PlanificacionCorteUncheckedUpdateInput {
    const { otId, operarioId, ...rest } = dto;
    return {
        ...rest,
        otId: otId !== undefined ? BigInt(otId) : undefined,
        operarioId: operarioId !== undefined ? BigInt(operarioId) : undefined,
    };
}

@Injectable()
export class PlanificacionCorteService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryPlanificacionDto) {
        const where: Prisma.PlanificacionCorteWhereInput = {
            ...(query.otId !== undefined ? { otId: BigInt(query.otId) } : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.planificacionCorte.findMany({
                where,
                include: {
                    ordenTrabajo: { select: { id: true, numeroOt: true } },
                    operario: true,
                    _count: { select: { items: true } },
                },
                orderBy: { fechaInicio: 'desc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.planificacionCorte.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const planificacion = await this.prisma.planificacionCorte.findUnique({
            where: { id },
            include: {
                ordenTrabajo: { select: { id: true, numeroOt: true } },
                operario: true,
                items: { include: { despieceOt: { include: { articulo: true } } } },
            },
        });
        if (!planificacion) throw new NotFoundException(`Planificacion ${id} no encontrada`);
        return planificacion;
    }

    private async assertExists(id: bigint) {
        const exists = await this.prisma.planificacionCorte.findUnique({ where: { id }, select: { id: true } });
        if (!exists) throw new NotFoundException(`Planificacion ${id} no encontrada`);
    }

    create(dto: CreatePlanificacionDto) {
        return this.prisma.planificacionCorte.create({ data: toCreateData(dto) });
    }

    async update(id: bigint, dto: UpdatePlanificacionDto) {
        await this.assertExists(id);
        return this.prisma.planificacionCorte.update({ where: { id }, data: toUpdateData(dto) });
    }

    async remove(id: bigint) {
        await this.assertExists(id);
        await this.prisma.planificacionCorte.delete({ where: { id } });
    }

    async addItem(id: bigint, dto: AddItemDto) {
        await this.assertExists(id);
        const despieceOtId = BigInt(dto.despieceOtId);
        return this.prisma.planificacionCorteItem.create({
            data: { planificacionId: id, despieceOtId },
        });
    }

    async removeItem(id: bigint, despieceOtId: bigint) {
        const item = await this.prisma.planificacionCorteItem.findUnique({
            where: { planificacionId_despieceOtId: { planificacionId: id, despieceOtId } },
        });
        if (!item) throw new NotFoundException(`Item ${despieceOtId} no encontrado en la planificacion ${id}`);
        await this.prisma.planificacionCorteItem.delete({
            where: { planificacionId_despieceOtId: { planificacionId: id, despieceOtId } },
        });
    }
}
