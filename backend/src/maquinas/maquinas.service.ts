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

        return { data, total, page: query.page, limit: query.limit };
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
