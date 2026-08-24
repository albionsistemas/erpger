import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { QueryArticuloDto } from './dto/query-articulo.dto';
import { CreatePrecioDto } from './dto/create-precio.dto';

@Injectable()
export class ArticulosService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryArticuloDto) {
        // "codigo" = el id (legacy CodigodeArticulo), no codigoAlbion --
        // ese campo no se uso en la practica (34% de fill rate pero el
        // usuario confirmo que no es un dato real a considerar). Si
        // "buscar" es numerico se interpreta como busqueda por codigo
        // exacto ademas de por nombre.
        const buscarComoId = query.buscar && /^\d+$/.test(query.buscar) ? BigInt(query.buscar) : null;
        const where: Prisma.ArticuloWhereInput = {
            ...(query.categoriaId !== undefined ? { categoriaId: query.categoriaId } : {}),
            ...(query.subcategoriaId !== undefined ? { subcategoriaId: query.subcategoriaId } : {}),
            ...(query.buscar
                ? {
                      OR: [
                          { nombre: { contains: query.buscar, mode: 'insensitive' } },
                          ...(buscarComoId !== null ? [{ id: buscarComoId }] : []),
                      ],
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.articulo.findMany({
                where,
                include: {
                    categoria: true,
                    subcategoria: true,
                    rubro: true,
                    precios: { orderBy: { fecha: 'desc' }, take: 1 },
                },
                orderBy: { nombre: 'asc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.articulo.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const articulo = await this.prisma.articulo.findUnique({
            where: { id },
            include: {
                categoria: true,
                subcategoria: true,
                rubro: true,
                precios: { orderBy: { fecha: 'desc' } },
            },
        });
        if (!articulo) throw new NotFoundException(`Articulo ${id} no encontrado`);
        return articulo;
    }

    // creadoPor queda sin setear hasta que exista el modulo de Auth que
    // resuelva el usuario autenticado actual.
    create(dto: CreateArticuloDto) {
        return this.prisma.articulo.create({ data: dto });
    }

    async update(id: bigint, dto: UpdateArticuloDto) {
        await this.findOne(id);
        return this.prisma.articulo.update({ where: { id }, data: dto });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.articulo.delete({ where: { id } });
    }

    // Historial de precio en USD: bitacora append-only, igual criterio
    // que catalogo.cotizaciones -- nunca se actualiza/borra una fila, un
    // cambio de precio siempre es una fila nueva.
    async listPrecios(articuloId: bigint) {
        await this.findOne(articuloId);
        return this.prisma.articuloPrecio.findMany({
            where: { articuloId },
            orderBy: { fecha: 'desc' },
        });
    }

    async addPrecio(articuloId: bigint, dto: CreatePrecioDto) {
        await this.findOne(articuloId);
        return this.prisma.articuloPrecio.create({
            data: { articuloId, precioUsd: dto.precioUsd, motivo: dto.motivo },
        });
    }

    async updateImagen(id: bigint, imagenUrl: string) {
        await this.findOne(id);
        return this.prisma.articulo.update({ where: { id }, data: { imagenUrl } });
    }
}
