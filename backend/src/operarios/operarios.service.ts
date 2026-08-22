import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOperarioDto } from './dto/create-operario.dto';
import { UpdateOperarioDto } from './dto/update-operario.dto';
import { QueryOperarioDto } from './dto/query-operario.dto';

@Injectable()
export class OperariosService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryOperarioDto) {
        const where = {
            ...(query.sectorId !== undefined ? { sectorId: query.sectorId } : {}),
            ...(query.activo !== undefined ? { activo: query.activo } : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.operario.findMany({
                where,
                include: { sector: true },
                orderBy: { nombre: 'asc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.operario.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const operario = await this.prisma.operario.findUnique({
            where: { id },
            include: { sector: true },
        });
        if (!operario) throw new NotFoundException(`Operario ${id} no encontrado`);
        return operario;
    }

    create(dto: CreateOperarioDto) {
        return this.prisma.operario.create({ data: dto });
    }

    async update(id: bigint, dto: UpdateOperarioDto) {
        await this.findOne(id);
        return this.prisma.operario.update({ where: { id }, data: dto });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.operario.delete({ where: { id } });
    }
}
