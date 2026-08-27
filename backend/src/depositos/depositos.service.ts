import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { UpdateDepositoDto } from './dto/update-deposito.dto';

const CON_EMPRESAS = {
    include: { empresas: { include: { empresa: true } } },
} as const;

@Injectable()
export class DepositosService {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.deposito.findMany({ ...CON_EMPRESAS, orderBy: { nombre: 'asc' } });
    }

    async findOne(id: bigint) {
        const deposito = await this.prisma.deposito.findUnique({ where: { id }, ...CON_EMPRESAS });
        if (!deposito) throw new NotFoundException(`Deposito ${id} no encontrado`);
        return deposito;
    }

    create(dto: CreateDepositoDto, creadoPor?: bigint) {
        const { empresaIds, ...datos } = dto;
        return this.prisma.deposito.create({
            data: {
                ...datos,
                creadoPor,
                empresas: empresaIds ? { create: empresaIds.map((empresaId) => ({ empresaId })) } : undefined,
            },
            ...CON_EMPRESAS,
        });
    }

    async update(id: bigint, dto: UpdateDepositoDto) {
        await this.findOne(id);
        const { empresaIds, ...datos } = dto;
        return this.prisma.$transaction(async (tx) => {
            if (empresaIds !== undefined) {
                await tx.depositoEmpresa.deleteMany({ where: { depositoId: id } });
                if (empresaIds.length > 0) {
                    await tx.depositoEmpresa.createMany({
                        data: empresaIds.map((empresaId) => ({ depositoId: id, empresaId: BigInt(empresaId) })),
                    });
                }
            }
            return tx.deposito.update({ where: { id }, data: datos, ...CON_EMPRESAS });
        });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.deposito.delete({ where: { id } });
    }
}
