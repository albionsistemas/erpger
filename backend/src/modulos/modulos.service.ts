import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Injectable()
export class ModulosService {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.modulo.findMany({ orderBy: { nombre: 'asc' } });
    }

    async findOne(id: number) {
        const modulo = await this.prisma.modulo.findUnique({ where: { id } });
        if (!modulo) throw new NotFoundException(`Modulo ${id} no encontrado`);
        return modulo;
    }

    create(dto: CreateModuloDto) {
        return this.prisma.modulo.create({ data: dto });
    }

    async update(id: number, dto: UpdateModuloDto) {
        await this.findOne(id);
        return this.prisma.modulo.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.modulo.delete({ where: { id } });
    }
}
