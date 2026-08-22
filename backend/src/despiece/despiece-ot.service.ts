import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDespieceOtDto } from './dto/create-despiece-ot.dto';
import { UpdateDespieceOtDto } from './dto/update-despiece-ot.dto';
import { QueryDespieceOtDto } from './dto/query-despiece.dto';

@Injectable()
export class DespieceOtService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryDespieceOtDto) {
        const where: Prisma.DespieceOtWhereInput = {
            ...(query.plano ? { plano: { contains: query.plano, mode: 'insensitive' } } : {}),
            ...(query.articuloId !== undefined ? { articuloId: BigInt(query.articuloId) } : {}),
            ...(query.otId !== undefined ? { otId: BigInt(query.otId) } : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.despieceOt.findMany({
                where,
                include: { articulo: true },
                orderBy: [{ otId: 'asc' }, { item: 'asc' }],
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.despieceOt.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const item = await this.prisma.despieceOt.findUnique({
            where: { id },
            include: { articulo: true, ordenTrabajo: { select: { id: true, numeroOt: true } } },
        });
        if (!item) throw new NotFoundException(`Item de despiece_ot ${id} no encontrado`);
        return item;
    }

    create(dto: CreateDespieceOtDto) {
        const { articuloId, otId, ...rest } = dto;
        return this.prisma.despieceOt.create({
            data: {
                ...rest,
                otId: BigInt(otId),
                articuloId: articuloId !== undefined ? BigInt(articuloId) : undefined,
            },
        });
    }

    async update(id: bigint, dto: UpdateDespieceOtDto) {
        await this.findOne(id);
        const { articuloId, otId, ...rest } = dto;
        return this.prisma.despieceOt.update({
            where: { id },
            data: {
                ...rest,
                otId: otId !== undefined ? BigInt(otId) : undefined,
                articuloId: articuloId !== undefined ? BigInt(articuloId) : undefined,
            },
        });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.despieceOt.delete({ where: { id } });
    }
}
