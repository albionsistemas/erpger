import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

// Seam minimo de multi-tenancy (ver db/postgresql/003_empresas.sql).
// No hay aislamiento de datos de negocio por empresa todavia -- este
// CRUD es solo para tener el concepto de tenant disponible en Auth.
@Injectable()
export class EmpresasService {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.empresa.findMany({ orderBy: { nombre: 'asc' } });
    }

    async findOne(id: bigint) {
        const empresa = await this.prisma.empresa.findUnique({ where: { id } });
        if (!empresa) throw new NotFoundException(`Empresa ${id} no encontrada`);
        return empresa;
    }

    create(dto: CreateEmpresaDto) {
        return this.prisma.empresa.create({ data: dto });
    }

    async update(id: bigint, dto: UpdateEmpresaDto) {
        await this.findOne(id);
        return this.prisma.empresa.update({ where: { id }, data: dto });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.empresa.delete({ where: { id } });
    }
}
