import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { QueryArticuloDto } from './dto/query-articulo.dto';

@Injectable()
export class ArticulosService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryArticuloDto) {
        const where: Prisma.ArticuloWhereInput = {
            ...(query.categoriaId !== undefined ? { categoriaId: query.categoriaId } : {}),
            ...(query.subcategoriaId !== undefined ? { subcategoriaId: query.subcategoriaId } : {}),
            ...(query.buscar
                ? {
                      OR: [
                          { nombre: { contains: query.buscar, mode: 'insensitive' } },
                          { codigoAlbion: { contains: query.buscar, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.articulo.findMany({
                where,
                include: { categoria: true, subcategoria: true },
                orderBy: { nombre: 'asc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.articulo.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const articulo = await this.prisma.articulo.findUnique({
            where: { id },
            include: { categoria: true, subcategoria: true },
        });
        if (!articulo) throw new NotFoundException(`Articulo ${id} no encontrado`);
        return articulo;
    }

    // creadoPor queda sin setear hasta que exista el modulo de Auth que
    // resuelva el usuario autenticado actual.
    create(dto: CreateArticuloDto) {
        return this.prisma.articulo.create({ data: dto });
    }

    async update(id: bigint, dto: UpdateArticuloDto) {
        await this.findOne(id);
        return this.prisma.articulo.update({ where: { id }, data: dto });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.articulo.delete({ where: { id } });
    }
}
