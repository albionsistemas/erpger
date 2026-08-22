import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDespieceMaquinaDto } from './dto/create-despiece-maquina.dto';
import { UpdateDespieceMaquinaDto } from './dto/update-despiece-maquina.dto';
import { QueryDespieceDto } from './dto/query-despiece.dto';

@Injectable()
export class DespieceMaquinasService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryDespieceDto) {
        const where: Prisma.DespieceMaquinaWhereInput = {
            ...(query.plano ? { plano: { contains: query.plano, mode: 'insensitive' } } : {}),
            ...(query.articuloId !== undefined ? { articuloId: BigInt(query.articuloId) } : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.despieceMaquina.findMany({
                where,
                include: { articulo: true },
                orderBy: [{ plano: 'asc' }, { item: 'asc' }],
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.despieceMaquina.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const item = await this.prisma.despieceMaquina.findUnique({ where: { id }, include: { articulo: true } });
        if (!item) throw new NotFoundException(`Item de despiece_maquinas ${id} no encontrado`);
        return item;
    }

    create(dto: CreateDespieceMaquinaDto) {
        const { articuloId, ...rest } = dto;
        return this.prisma.despieceMaquina.create({
            data: { ...rest, articuloId: articuloId !== undefined ? BigInt(articuloId) : undefined },
        });
    }

    async update(id: bigint, dto: UpdateDespieceMaquinaDto) {
        await this.findOne(id);
        const { articuloId, ...rest } = dto;
        return this.prisma.despieceMaquina.update({
            where: { id },
            data: { ...rest, articuloId: articuloId !== undefined ? BigInt(articuloId) : undefined },
        });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.despieceMaquina.delete({ where: { id } });
    }
}
