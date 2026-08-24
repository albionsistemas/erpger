import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';

@Injectable()
export class MonedasService {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.moneda.findMany({
            orderBy: { nombre: 'asc' },
            include: { cotizaciones: { orderBy: { fecha: 'desc' }, take: 1 } },
        });
    }

    async findOne(id: number) {
        const moneda = await this.prisma.moneda.findUnique({ where: { id } });
        if (!moneda) throw new NotFoundException(`Moneda ${id} no encontrada`);
        return moneda;
    }

    create(dto: CreateMonedaDto) {
        return this.prisma.moneda.create({ data: dto });
    }

    async update(id: number, dto: UpdateMonedaDto) {
        await this.findOne(id);
        return this.prisma.moneda.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.moneda.delete({ where: { id } });
    }
}
