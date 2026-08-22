import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoMaquinaDto } from './dto/create-tipo-maquina.dto';
import { UpdateTipoMaquinaDto } from './dto/update-tipo-maquina.dto';

@Injectable()
export class TiposMaquinaService {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.tipoMaquina.findMany({ orderBy: { nombre: 'asc' } });
    }

    async findOne(id: number) {
        const tipo = await this.prisma.tipoMaquina.findUnique({ where: { id } });
        if (!tipo) throw new NotFoundException(`Tipo de maquina ${id} no encontrado`);
        return tipo;
    }

    create(dto: CreateTipoMaquinaDto) {
        return this.prisma.tipoMaquina.create({ data: dto });
    }

    async update(id: number, dto: UpdateTipoMaquinaDto) {
        await this.findOne(id);
        return this.prisma.tipoMaquina.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.tipoMaquina.delete({ where: { id } });
    }
}
