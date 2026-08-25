import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDespieceMaquinaDto } from './dto/create-despiece-maquina.dto';
import { UpdateDespieceMaquinaDto } from './dto/update-despiece-maquina.dto';
import { QueryDespieceDto } from './dto/query-despiece.dto';

@Injectable()
export class DespieceMaquinasService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryDespieceDto) {
        // "plano" filtra el despiece de UNA maquina puntual (match
        // exacto contra maquinas.plano_id, no busqueda parcial -- ids
        // como "502" y "502_21" son maquinas distintas). Cuando viene
        // seteado se trae la lista completa sin paginar: es la pantalla
        // de despiece de una maquina, no un listado general, y el
        // filtrado/agrupado por COD se hace en el cliente.
        const where: Prisma.DespieceMaquinaWhereInput = {
            ...(query.plano ? { plano: query.plano } : {}),
            ...(query.articuloId !== undefined ? { articuloId: BigInt(query.articuloId) } : {}),
        };
        const sinPaginar = !!query.plano;

        const [data, total] = await Promise.all([
            this.prisma.despieceMaquina.findMany({
                where,
                include: { articulo: true },
                orderBy: [{ plano: 'asc' }, { item: 'asc' }],
                ...(sinPaginar ? {} : { skip: query.skip, take: query.limit }),
            }),
            this.prisma.despieceMaquina.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const item = await this.prisma.despieceMaquina.findUnique({ where: { id }, include: { articulo: true } });
        if (!item) throw new NotFoundException(`Item de despiece_maquinas ${id} no encontrado`);
        return item;
    }

    create(dto: CreateDespieceMaquinaDto, creadoPor: bigint) {
        const { articuloId, ...rest } = dto;
        return this.prisma.despieceMaquina.create({
            data: { ...rest, articuloId: articuloId !== undefined ? BigInt(articuloId) : undefined, creadoPor },
        });
    }

    async update(id: bigint, dto: UpdateDespieceMaquinaDto) {
        await this.findOne(id);
        const { articuloId, ...rest } = dto;
        return this.prisma.despieceMaquina.update({
            where: { id },
            data: { ...rest, articuloId: articuloId !== undefined ? BigInt(articuloId) : undefined },
        });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.despieceMaquina.delete({ where: { id } });
    }

    // Reemplaza el "Borrar todos los items" del legacy, que estaba
    // restringido a 2 usuarios hardcodeados por nombre en vez de por
    // permiso de modulo.
    async removeByPlano(plano: string) {
        const { count } = await this.prisma.despieceMaquina.deleteMany({ where: { plano } });
        return { eliminados: count };
    }

    // Para Ingenieria: en que otras maquinas se usa este articulo (sin
    // nada de precio/costo, eso es de Compras). Agrupa por plano (texto
    // libre, sin FK a maquinas) en JS en vez de con GROUP BY en SQL
    // porque necesitamos ademas la fecha y el usuario de la PRIMERA vez
    // que se cargo esa pieza en cada maquina, no solo el total.
    //
    // "cantidadPiezas" es la SUMA del campo cantidad de todas las
    // lineas de esa maquina que usan el articulo (cuantas unidades se
    // necesitan en total), no la cantidad de lineas -- una sola linea
    // con cantidad=4 cuenta como 4, no como 1.
    async usoEnMaquinas(articuloId: bigint) {
        const filas = await this.prisma.despieceMaquina.findMany({
            where: { articuloId },
            select: {
                plano: true,
                cantidad: true,
                creadoEn: true,
                creador: { select: { id: true, username: true, nombre: true } },
            },
            orderBy: { creadoEn: 'asc' },
        });

        const porPlano = new Map<
            string,
            { fechaAlta: Date; usuario: { id: bigint; username: string; nombre: string | null } | null; cantidadPiezas: number }
        >();
        for (const f of filas) {
            if (!f.plano) continue;
            const existente = porPlano.get(f.plano);
            if (existente) {
                existente.cantidadPiezas += f.cantidad;
            } else {
                porPlano.set(f.plano, { fechaAlta: f.creadoEn, usuario: f.creador, cantidadPiezas: f.cantidad });
            }
        }

        const planos = [...porPlano.keys()];
        const maquinas = await this.prisma.maquina.findMany({
            where: { planoId: { in: planos } },
            include: { tipoMaquina: true },
        });
        const maquinaPorPlano = new Map(maquinas.map((m) => [m.planoId, m]));

        return [...porPlano.entries()]
            .map(([plano, info]) => {
                const maquina = maquinaPorPlano.get(plano);
                if (!maquina) return null;
                return {
                    maquinaId: maquina.id,
                    maquinaNombre: maquina.nombre,
                    planoId: maquina.planoId,
                    tipoMaquina: maquina.tipoMaquina?.nombre ?? null,
                    fechaAlta: info.fechaAlta,
                    usuario: info.usuario,
                    cantidadPiezas: info.cantidadPiezas,
                };
            })
            .filter((r): r is NonNullable<typeof r> => r !== null)
            .sort((a, b) => b.cantidadPiezas - a.cantidadPiezas);
    }
}
