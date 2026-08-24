import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { Permiso } from '../common/decorators/permiso.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types';

// Historial de tipo de cambio. Solo lectura + alta: una cotizacion
// cargada por error se corrige cargando una fila nueva, no editando ni
// borrando la anterior (bitacora, igual criterio que ot_cambios).
@Controller('cotizaciones')
export class CotizacionesController {
    constructor(private readonly cotizaciones: CotizacionesService) {}

    @Get()
    findAll(@Query('monedaId') monedaId?: string) {
        return this.cotizaciones.findAll(monedaId ? Number(monedaId) : undefined);
    }

    @Permiso('compras', 'EDITAR')
    @Post()
    create(@Body() dto: CreateCotizacionDto, @CurrentUser() user: JwtPayload) {
        return this.cotizaciones.create(dto, BigInt(user.sub));
    }
}
