import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

// Nacio como seam minimo de multi-tenancy para Auth (ver
// db/postgresql/003_empresas.sql), pero Albion factura/compra desde 2 o
// 3 firmas reales a la vez (ver 027_empresas_datos.sql) -- estos
// registros son datos de negocio reales (CUIT, banco, logo para
// membretes), no solo el concepto de tenant. Sigue sin haber
// aislamiento de datos por empresa en el resto del sistema.
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

    async updateLogo(id: bigint, logoUrl: string) {
        await this.findOne(id);
        return this.prisma.empresa.update({ where: { id }, data: { logoUrl } });
    }
}
