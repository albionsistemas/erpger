import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Catalogos de solo lectura: se pueblan via el DDL/ETL, no tienen
// endpoints de escritura por ahora. Si el negocio necesita altas desde
// la UI (ej. agregar un nuevo tipo de maquina) se agrega CRUD puntual
// cuando haga falta, en vez de anticiparlo aca.
@Injectable()
export class CatalogosService {
    constructor(private readonly prisma: PrismaService) {}

    tiposOrden() {
        return this.prisma.tipoOrden.findMany({ orderBy: { nombre: 'asc' } });
    }

    estadosOf() {
        return this.prisma.estadoOf.findMany({ orderBy: { id: 'asc' } });
    }

    estadosOt() {
        return this.prisma.estadoOt.findMany({ orderBy: { id: 'asc' } });
    }

    sectoresProduccion() {
        return this.prisma.sectorProduccion.findMany({ orderBy: { orden: 'asc' } });
    }

    tiposMaquina() {
        return this.prisma.tipoMaquina.findMany({ orderBy: { nombre: 'asc' } });
    }

    tiposCambioBom() {
        return this.prisma.tipoCambioBom.findMany({ orderBy: { nombre: 'asc' } });
    }

    rubros() {
        return this.prisma.rubro.findMany({ orderBy: { nombre: 'asc' } });
    }

    motivosMovimiento() {
        return this.prisma.motivoMovimiento.findMany({ orderBy: { nombre: 'asc' } });
    }
}
