import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { QueryOrdenTrabajoDto } from './dto/query-orden-trabajo.dto';
import { UpsertEtapaDto } from './dto/upsert-etapa.dto';
import { CreateTerceroDto } from './dto/create-tercero.dto';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';

function toCreateData(dto: CreateOrdenTrabajoDto): Prisma.OrdenTrabajoUncheckedCreateInput {
    const { ofId, maquinaId, ...rest } = dto;
    return {
        ...rest,
        ofId: BigInt(ofId),
        maquinaId: maquinaId !== undefined ? BigInt(maquinaId) : undefined,
    };
}

function toUpdateData(dto: UpdateOrdenTrabajoDto): Prisma.OrdenTrabajoUncheckedUpdateInput {
    const { ofId, maquinaId, ...rest } = dto;
    return {
        ...rest,
        ofId: ofId !== undefined ? BigInt(ofId) : undefined,
        maquinaId: maquinaId !== undefined ? BigInt(maquinaId) : undefined,
    };
}

@Injectable()
export class OrdenesTrabajoService {
    constructor(private readonly prisma: PrismaService) {}

    // ---------------------------------------------------------------
    // OT
    // ---------------------------------------------------------------

    async findAll(query: QueryOrdenTrabajoDto) {
        const where: Prisma.OrdenTrabajoWhereInput = {
            ...(query.ofId !== undefined ? { ofId: BigInt(query.ofId) } : {}),
            ...(query.estadoId !== undefined ? { estadoId: query.estadoId } : {}),
            ...(query.buscar
                ? {
                      OR: [
                          { maquinaNombre: { contains: query.buscar, mode: 'insensitive' } },
                          { referencia: { contains: query.buscar, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.ordenTrabajo.findMany({
                where,
                include: {
                    estado: true,
                    maquina: true,
                    ordenFabricacion: { select: { id: true, numeroOf: true } },
                },
                orderBy: { numeroOt: 'asc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.ordenTrabajo.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const ot = await this.prisma.ordenTrabajo.findUnique({
            where: { id },
            include: {
                estado: true,
                maquina: true,
                ordenFabricacion: { select: { id: true, numeroOf: true, cliente: true } },
                etapas: { include: { sector: true }, orderBy: { sector: { orden: 'asc' } } },
                terceros: true,
                imagenes: { orderBy: { orden: 'asc' } },
                tareas: { include: { sector: true, operario: true }, orderBy: { fechaInicio: 'asc' } },
            },
        });
        if (!ot) throw new NotFoundException(`Orden de Trabajo ${id} no encontrada`);
        return ot;
    }

    private async assertExists(id: bigint) {
        const exists = await this.prisma.ordenTrabajo.findUnique({ where: { id }, select: { id: true } });
        if (!exists) throw new NotFoundException(`Orden de Trabajo ${id} no encontrada`);
    }

    create(dto: CreateOrdenTrabajoDto) {
        return this.prisma.ordenTrabajo.create({ data: toCreateData(dto) });
    }

    async update(id: bigint, dto: UpdateOrdenTrabajoDto) {
        await this.assertExists(id);
        return this.prisma.ordenTrabajo.update({ where: { id }, data: toUpdateData(dto) });
    }

    async remove(id: bigint) {
        await this.assertExists(id);
        await this.prisma.ordenTrabajo.delete({ where: { id } });
    }

    // ---------------------------------------------------------------
    // ETAPAS (una fila fija por sector, se marca completada/pendiente)
    // ---------------------------------------------------------------

    async findEtapas(otId: bigint) {
        await this.assertExists(otId);
        return this.prisma.otEtapa.findMany({
            where: { otId },
            include: { sector: true, usuario: true },
            orderBy: { sector: { orden: 'asc' } },
        });
    }

    async upsertEtapa(otId: bigint, sectorId: number, dto: UpsertEtapaDto) {
        await this.assertExists(otId);
        return this.prisma.otEtapa.upsert({
            where: { otId_sectorId: { otId, sectorId } },
            create: {
                otId,
                sectorId,
                completada: dto.completada,
                porcentaje: dto.completada ? 100 : 0,
                fechaCompletada: dto.fechaCompletada,
                usuarioId: dto.usuarioId !== undefined ? BigInt(dto.usuarioId) : undefined,
            },
            update: {
                completada: dto.completada,
                porcentaje: dto.completada ? 100 : 0,
                fechaCompletada: dto.fechaCompletada,
                usuarioId: dto.usuarioId !== undefined ? BigInt(dto.usuarioId) : undefined,
            },
        });
    }

    // ---------------------------------------------------------------
    // TERCEROS
    // ---------------------------------------------------------------

    async findTerceros(otId: bigint) {
        await this.assertExists(otId);
        return this.prisma.otTercero.findMany({ where: { otId }, orderBy: { id: 'asc' } });
    }

    async addTercero(otId: bigint, dto: CreateTerceroDto) {
        await this.assertExists(otId);
        return this.prisma.otTercero.create({ data: { ...dto, otId } });
    }

    async updateTercero(otId: bigint, terceroId: bigint, dto: Partial<CreateTerceroDto>) {
        await this.assertTerceroBelongsToOt(otId, terceroId);
        return this.prisma.otTercero.update({ where: { id: terceroId }, data: dto });
    }

    async removeTercero(otId: bigint, terceroId: bigint) {
        await this.assertTerceroBelongsToOt(otId, terceroId);
        await this.prisma.otTercero.delete({ where: { id: terceroId } });
    }

    private async assertTerceroBelongsToOt(otId: bigint, terceroId: bigint) {
        const tercero = await this.prisma.otTercero.findUnique({ where: { id: terceroId } });
        if (!tercero) throw new NotFoundException(`Tercero ${terceroId} no encontrado`);
        if (tercero.otId !== otId) throw new BadRequestException(`El tercero ${terceroId} no pertenece a la OT ${otId}`);
    }

    // ---------------------------------------------------------------
    // IMAGENES
    // ---------------------------------------------------------------

    async findImagenes(otId: bigint) {
        await this.assertExists(otId);
        return this.prisma.otImagen.findMany({ where: { otId }, orderBy: { orden: 'asc' } });
    }

    async addImagen(otId: bigint, dto: CreateImagenDto) {
        await this.assertExists(otId);
        return this.prisma.otImagen.create({ data: { ...dto, otId } });
    }

    async removeImagen(otId: bigint, imagenId: bigint) {
        const imagen = await this.prisma.otImagen.findUnique({ where: { id: imagenId } });
        if (!imagen) throw new NotFoundException(`Imagen ${imagenId} no encontrada`);
        if (imagen.otId !== otId) throw new BadRequestException(`La imagen ${imagenId} no pertenece a la OT ${otId}`);
        await this.prisma.otImagen.delete({ where: { id: imagenId } });
    }

    // ---------------------------------------------------------------
    // TAREAS
    // ---------------------------------------------------------------

    async findTareas(otId: bigint) {
        await this.assertExists(otId);
        return this.prisma.tarea.findMany({
            where: { otId },
            include: { sector: true, operario: true },
            orderBy: { fechaInicio: 'asc' },
        });
    }

    async addTarea(otId: bigint, dto: CreateTareaDto) {
        await this.assertExists(otId);
        const { operarioId, ...rest } = dto;
        return this.prisma.tarea.create({
            data: { ...rest, otId, operarioId: operarioId !== undefined ? BigInt(operarioId) : undefined },
        });
    }

    async updateTarea(otId: bigint, tareaId: bigint, dto: UpdateTareaDto) {
        await this.assertTareaBelongsToOt(otId, tareaId);
        const { operarioId, ...rest } = dto;
        return this.prisma.tarea.update({
            where: { id: tareaId },
            data: { ...rest, operarioId: operarioId !== undefined ? BigInt(operarioId) : undefined },
        });
    }

    async removeTarea(otId: bigint, tareaId: bigint) {
        await this.assertTareaBelongsToOt(otId, tareaId);
        await this.prisma.tarea.delete({ where: { id: tareaId } });
    }

    private async assertTareaBelongsToOt(otId: bigint, tareaId: bigint) {
        const tarea = await this.prisma.tarea.findUnique({ where: { id: tareaId } });
        if (!tarea) throw new NotFoundException(`Tarea ${tareaId} no encontrada`);
        if (tarea.otId !== otId) throw new BadRequestException(`La tarea ${tareaId} no pertenece a la OT ${otId}`);
    }
}
