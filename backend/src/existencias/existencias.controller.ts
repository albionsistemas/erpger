import { Controller, Get, Query } from '@nestjs/common';
import { ExistenciasService } from './existencias.service';

// Solo lectura -- las existencias solo cambian via movimientos-stock
// (ver MovimientosStockService.aplicarDelta), no hay escritura directa.
@Controller('existencias')
export class ExistenciasController {
    constructor(private readonly existencias: ExistenciasService) {}

    @Get()
    findAll(@Query('depositoId') depositoId?: string, @Query('articuloId') articuloId?: string) {
        return this.existencias.findAll(
            depositoId !== undefined ? Number(depositoId) : undefined,
            articuloId !== undefined ? Number(articuloId) : undefined,
        );
    }

    @Get('resumen')
    resumen() {
        return this.existencias.resumen();
    }
}
