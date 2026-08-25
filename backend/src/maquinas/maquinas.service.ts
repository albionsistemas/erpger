import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';
import { QueryMaquinaDto, CampoOrdenableMaquina } from './dto/query-maquina.dto';
import { ExportMaquinaDto } from './dto/export-maquina.dto';
import { esFechaDesconocida } from '../common/fecha-desconocida';

@Injectable()
export class MaquinasService {
    constructor(private readonly prisma: PrismaService) {}

    private buildWhere(query: { tipoMaquinaId?: number; buscar?: string }): Prisma.MaquinaWhereInput {
        return {
            ...(query.tipoMaquinaId !== undefined ? { tipoMaquinaId: query.tipoMaquinaId } : {}),
            ...(query.buscar
                ? {
                      OR: [
                          { nombre: { contains: query.buscar, mode: 'insensitive' } },
                          { planoId: { contains: query.buscar, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };
    }

    // Trae TODAS las maquinas que matchean el filtro (sin paginar) con
    // "partesCount" resuelto. despiece_maquinas.plano no tiene FK a
    // maquinas (es texto libre), asi que la cuenta se resuelve por
    // valor con un groupBy aparte, no con una relacion de Prisma. Se
    // usa tanto para el listado (pagina y ordena en JS porque
    // partesCount no es una columna real) como para la exportacion a
    // Excel -- 1618 maquinas en total, entra comodo en memoria.
    private async filtradasConPartes(where: Prisma.MaquinaWhereInput) {
        const todas = await this.prisma.maquina.findMany({
            where,
            include: { tipoMaquina: true, creador: { select: { id: true, username: true, nombre: true } } },
        });

        const planoIds = todas.map((m) => m.planoId);
        const counts = await this.prisma.despieceMaquina.groupBy({
            by: ['plano'],
            where: { plano: { in: planoIds } },
            _count: { _all: true },
        });
        const countMap = new Map(counts.map((c) => [c.plano, c._count._all]));
        return todas.map((m) => ({ ...m, partesCount: countMap.get(m.planoId) ?? 0 }));
    }

    private ordenar<T extends { planoId: string; nombre: string; partesCount: number; creadoEn: Date }>(
        filas: T[],
        sortField: CampoOrdenableMaquina | undefined,
        sortOrder: 'asc' | 'desc' | undefined,
    ): T[] {
        const campo = sortField ?? 'creadoEn';
        const signo = sortOrder === 'asc' ? 1 : -1;
        return [...filas].sort((a, b) => {
            switch (campo) {
                case 'planoId':
                    return signo * a.planoId.localeCompare(b.planoId);
                case 'nombre':
                    return signo * a.nombre.localeCompare(b.nombre);
                case 'partesCount':
                    return signo * (a.partesCount - b.partesCount);
                case 'creadoEn':
                    return signo * (a.creadoEn.getTime() - b.creadoEn.getTime());
            }
        });
    }

    async findAll(query: QueryMaquinaDto) {
        const filtradas = await this.filtradasConPartes(this.buildWhere(query));
        const ordenadas = this.ordenar(filtradas, query.sortField, query.sortOrder);
        const data = ordenadas.slice(query.skip, query.skip + query.limit);
        return { data, total: ordenadas.length, page: query.page, limit: query.limit };
    }

    async export(query: ExportMaquinaDto): Promise<Buffer> {
        const filtradas = await this.filtradasConPartes(this.buildWhere(query));
        const ordenadas = this.ordenar(filtradas, query.sortField, query.sortOrder);

        const workbook = new ExcelJS.Workbook();
        const hoja = workbook.addWorksheet('Maquinas');
        hoja.columns = [
            { header: 'Plano', key: 'plano', width: 16 },
            { header: 'Nombre', key: 'nombre', width: 45 },
            { header: 'Tipo de maquina', key: 'tipo', width: 22 },
            { header: 'Partes', key: 'partes', width: 10 },
            { header: 'Fecha de alta', key: 'fecha', width: 16 },
            { header: 'Cargada por', key: 'usuario', width: 22 },
        ];
        hoja.getRow(1).font = { bold: true };
        hoja.getColumn('fecha').numFmt = 'dd/mm/yyyy';

        for (const m of ordenadas) {
            hoja.addRow({
                plano: m.planoId,
                nombre: m.nombre,
                tipo: m.tipoMaquina?.nombre ?? '',
                partes: m.partesCount,
                fecha: esFechaDesconocida(m.creadoEn) ? '' : m.creadoEn,
                usuario: m.creador?.nombre ?? m.creador?.username ?? '',
            });
        }

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    async findOne(id: bigint) {
        const maquina = await this.prisma.maquina.findUnique({
            where: { id },
            include: {
                tipoMaquina: true,
                rubros: { include: { rubro: true } },
                creador: { select: { id: true, username: true, nombre: true } },
            },
        });
        if (!maquina) throw new NotFoundException(`Maquina ${id} no encontrada`);
        return maquina;
    }

    create(dto: CreateMaquinaDto) {
        return this.prisma.maquina.create({ data: dto });
    }

    async update(id: bigint, dto: UpdateMaquinaDto) {
        await this.findOne(id);
        return this.prisma.maquina.update({ where: { id }, data: dto });
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.maquina.delete({ where: { id } });
    }
}
