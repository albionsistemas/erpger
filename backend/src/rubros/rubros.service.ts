import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRubroDto } from './dto/create-rubro.dto';
import { UpdateRubroDto } from './dto/update-rubro.dto';

@Injectable()
export class RubrosService {
    constructor(private readonly prisma: PrismaService) {}

    findAll(buscar?: string) {
        const where: Prisma.RubroWhereInput = buscar
            ? { nombre: { contains: buscar, mode: 'insensitive' } }
            : {};
        return this.prisma.rubro.findMany({ where, orderBy: { nombre: 'asc' } });
    }

    async findOne(id: number) {
        const rubro = await this.prisma.rubro.findUnique({ where: { id } });
        if (!rubro) throw new NotFoundException(`Rubro ${id} no encontrado`);
        return rubro;
    }

    create(dto: CreateRubroDto) {
        return this.prisma.rubro.create({ data: dto });
    }

    async update(id: number, dto: UpdateRubroDto) {
        await this.findOne(id);
        return this.prisma.rubro.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.rubro.delete({ where: { id } });
    }

    async updateImagen(id: number, imagenUrl: string) {
        await this.findOne(id);
        return this.prisma.rubro.update({ where: { id }, data: { imagenUrl } });
    }
}
