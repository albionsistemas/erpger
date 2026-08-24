import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { QuerySubcategoriaDto } from './dto/query-subcategoria.dto';

@Injectable()
export class SubcategoriasService {
    constructor(private readonly prisma: PrismaService) {}

    findAll(query: QuerySubcategoriaDto) {
        const where: Prisma.SubcategoriaWhereInput = {
            ...(query.categoriaId !== undefined ? { categoriaId: query.categoriaId } : {}),
            ...(query.buscar ? { nombre: { contains: query.buscar, mode: 'insensitive' } } : {}),
        };
        return this.prisma.subcategoria.findMany({
            where,
            include: { categoria: true },
            orderBy: { nombre: 'asc' },
        });
    }

    async findOne(id: number) {
        const subcategoria = await this.prisma.subcategoria.findUnique({
            where: { id },
            include: { categoria: true },
        });
        if (!subcategoria) throw new NotFoundException(`Subcategoria ${id} no encontrada`);
        return subcategoria;
    }

    create(dto: CreateSubcategoriaDto) {
        return this.prisma.subcategoria.create({ data: dto });
    }

    async update(id: number, dto: UpdateSubcategoriaDto) {
        await this.findOne(id);
        return this.prisma.subcategoria.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.subcategoria.delete({ where: { id } });
    }
}
