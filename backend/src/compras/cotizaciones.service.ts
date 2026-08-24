import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';

// Bitacora append-only: nunca se actualiza ni se borra una cotizacion ya
// cargada (igual criterio que ot_cambios). Solo se lee y se agregan
// filas nuevas -- por eso este service no tiene update/remove.
@Injectable()
export class CotizacionesService {
    constructor(private readonly prisma: PrismaService) {}

    findAll(monedaId?: number) {
        return this.prisma.cotizacion.findMany({
            where: monedaId !== undefined ? { monedaId } : undefined,
            include: { moneda: true },
            orderBy: { fecha: 'desc' },
        });
    }

    create(dto: CreateCotizacionDto) {
        return this.prisma.cotizacion.create({
            data: { monedaId: dto.monedaId, tasaCambio: dto.tasaCambio, fuente: dto.fuente ?? 'MANUAL' },
            include: { moneda: true },
        });
    }
}
