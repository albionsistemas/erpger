import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDespieceEnsambleDto } from './dto/create-despiece-ensamble.dto';
import { UpdateDespieceEnsambleDto } from './dto/update-despiece-ensamble.dto';
import { QueryDespieceDto } from './dto/query-despiece.dto';

@Injectable()
export class DespieceEnsamblesService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryDespieceDto) {
        const where: Prisma.DespieceEnsambleWhereInput = {
            ...(query.plano ? { plano: { contains: query.plano, mode: 'insensitive' } } : {}),
            ...(query.articuloId !== undefined ? { articuloId: BigInt(query.articuloId) } : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.despieceEnsamble.findMany({
                where,
                include: { articulo: true },
                orderBy: [{ plano: 'asc' }, { item: 'asc' }],
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.despieceEnsamble.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const item = await this.prisma.despieceEnsamble.findUnique({ where: { id }, include: { articulo: true } });
        if (!item) throw new NotFoundException(`Item de despiece_ensambles ${id} no encontrado`);
        return item;
    }

    create(dto: CreateDespieceEnsambleDto) {
        const { articuloId, ...rest } = dto;
        return this.prisma.despieceEnsamble.create({
            data: { ...rest, articuloId: articuloId !== undefined ? BigInt(articuloId) : undefined },
        });
    }

    async update(id: bigint, dto: UpdateDespieceEnsambleDto) {
        await this.findOne(id);
        const { articuloId, ...rest } = dto;
        return this.prisma.despieceEnsamble.update({
            where: { id },
            data: { ...rest, articuloId: articuloId !== undefined ? BigInt(articuloId) : undefined },
        });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.despieceEnsamble.delete({ where: { id } });
    }
}
