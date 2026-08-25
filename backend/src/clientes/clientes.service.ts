import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { QueryClienteDto } from './dto/query-cliente.dto';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';

// Clientes de Albion (legacy \`clientesalbion\` -- ver
// db/postgresql/029_import_clientes.sql). Lectura abierta a cualquier
// autenticado (Ordenes de Fabricacion los necesita para el selector),
// edicion gateada al modulo Ventas.
@Injectable()
export class ClientesService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryClienteDto) {
        const where: Prisma.ClienteWhereInput = query.buscar
            ? {
                  OR: [
                      { razonSocial: { contains: query.buscar, mode: 'insensitive' } },
                      { cuit: { contains: query.buscar, mode: 'insensitive' } },
                  ],
              }
            : {};

        const [data, total] = await Promise.all([
            this.prisma.cliente.findMany({
                where,
                include: { _count: { select: { contactos: true, ordenesFabricacion: true } } },
                orderBy: { razonSocial: 'asc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.cliente.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const cliente = await this.prisma.cliente.findUnique({
            where: { id },
            include: {
                creador: { select: { id: true, username: true, nombre: true } },
                contactos: { orderBy: { orden: 'asc' } },
            },
        });
        if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
        return cliente;
    }

    create(dto: CreateClienteDto, creadoPor: bigint) {
        return this.prisma.cliente.create({ data: { ...dto, creadoPor } });
    }

    async update(id: bigint, dto: UpdateClienteDto) {
        await this.findOne(id);
        return this.prisma.cliente.update({ where: { id }, data: dto });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.cliente.delete({ where: { id } });
    }

    // --- Contactos ---

    async addContacto(clienteId: bigint, dto: CreateContactoDto) {
        await this.findOne(clienteId);
        return this.prisma.clienteContacto.create({ data: { ...dto, clienteId } });
    }

    private async findContacto(clienteId: bigint, id: bigint) {
        const contacto = await this.prisma.clienteContacto.findUnique({ where: { id } });
        if (!contacto || contacto.clienteId !== clienteId) throw new NotFoundException(`Contacto ${id} no encontrado`);
        return contacto;
    }

    async updateContacto(clienteId: bigint, id: bigint, dto: UpdateContactoDto) {
        await this.findContacto(clienteId, id);
        return this.prisma.clienteContacto.update({ where: { id }, data: dto });
    }

    async removeContacto(clienteId: bigint, id: bigint) {
        await this.findContacto(clienteId, id);
        await this.prisma.clienteContacto.delete({ where: { id } });
    }

    async updateContactoAvatar(clienteId: bigint, id: bigint, avatarUrl: string) {
        await this.findContacto(clienteId, id);
        return this.prisma.clienteContacto.update({ where: { id }, data: { avatarUrl } });
    }
}
