import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryOtCambioDto } from './dto/query-ot-cambio.dto';

// Solo lectura: la bitacora se genera desde el flujo de edicion del BOM
// (despiece_ot), no se escribe manualmente via API por ahora. Cuando el
// modulo de despiece incorpore edicion asistida de piezas, ese servicio
// puede llamar a un metodo de escritura interno aca en vez de exponer
// un endpoint POST publico.
@Injectable()
export class OtCambiosService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryOtCambioDto) {
        const where: Prisma.OtCambioWhereInput = {
            ...(query.otId !== undefined ? { otId: BigInt(query.otId) } : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.otCambio.findMany({
                where,
                include: {
                    tipoCambio: true,
                    articuloAnterior: true,
                    articuloNuevo: true,
                    usuarioAnterior: true,
                    usuarioNuevo: true,
                },
                orderBy: { fecha: 'desc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.otCambio.count({ where }),
        ]);

        return { data, total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const cambio = await this.prisma.otCambio.findUnique({
            where: { id },
            include: {
                tipoCambio: true,
                articuloAnterior: true,
                articuloNuevo: true,
                usuarioAnterior: true,
                usuarioNuevo: true,
            },
        });
        if (!cambio) throw new NotFoundException(`Cambio ${id} no encontrado`);
        return cambio;
    }
}
