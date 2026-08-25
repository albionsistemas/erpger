import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';
import { QueryMaquinaDto } from './dto/query-maquina.dto';

@Injectable()
export class MaquinasService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryMaquinaDto) {
        const where: Prisma.MaquinaWhereInput = {
            ...(query.tipoMaquinaId !== undefined ? { tipoMaquinaId: query.tipoMaquinaId } : {}),
            ...(query.buscar
                ? {
                      OR: [
                          { nombre: { contains: query.buscar, mode: 'insensitive' } },
                          { planoId: { contains: query.buscar, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.maquina.findMany({
                where,
                include: { tipoMaquina: true },
                orderBy: { nombre: 'asc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.maquina.count({ where }),
        ]);

        // despiece_maquinas.plano no tiene FK a maquinas (es texto
        // libre, ver 001_ingenieria_schema.sql), asi que la cuenta de
        // "Partes" se resuelve por valor en vez de con una relacion de
        // Prisma -- solo para las maquinas de la pagina actual.
        const planoIds = data.map((m) => m.planoId);
        const counts = await this.prisma.despieceMaquina.groupBy({
            by: ['plano'],
            where: { plano: { in: planoIds } },
            _count: { _all: true },
        });
        const countMap = new Map(counts.map((c) => [c.plano, c._count._all]));
        const dataConPartes = data.map((m) => ({ ...m, partesCount: countMap.get(m.planoId) ?? 0 }));

        return { data: dataConPartes, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const maquina = await this.prisma.maquina.findUnique({
            where: { id },
            include: { tipoMaquina: true, rubros: { include: { rubro: true } } },
        });
        if (!maquina) throw new NotFoundException(`Maquina ${id} no encontrada`);
        return maquina;
    }

    create(dto: CreateMaquinaDto) {
        return this.prisma.maquina.create({ data: dto });
    }

    async update(id: bigint, dto: UpdateMaquinaDto) {
        await this.findOne(id);
        return this.prisma.maquina.update({ where: { id }, data: dto });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.maquina.delete({ where: { id } });
    }
}
