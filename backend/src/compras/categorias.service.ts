import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
    constructor(private readonly prisma: PrismaService) {}

    findAll(buscar?: string) {
        const where: Prisma.CategoriaWhereInput = buscar
            ? { nombre: { contains: buscar, mode: 'insensitive' } }
            : {};
        return this.prisma.categoria.findMany({ where, orderBy: { nombre: 'asc' } });
    }

    async findOne(id: number) {
        const categoria = await this.prisma.categoria.findUnique({ where: { id } });
        if (!categoria) throw new NotFoundException(`Categoria ${id} no encontrada`);
        return categoria;
    }

    create(dto: CreateCategoriaDto) {
        return this.prisma.categoria.create({ data: dto });
    }

    async update(id: number, dto: UpdateCategoriaDto) {
        await this.findOne(id);
        return this.prisma.categoria.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.categoria.delete({ where: { id } });
    }
}
