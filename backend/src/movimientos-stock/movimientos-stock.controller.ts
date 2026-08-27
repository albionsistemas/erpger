import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MovimientosStockService } from './movimientos-stock.service';
import { CreateMovimientoStockDto } from './dto/create-movimiento-stock.dto';
import { QueryMovimientoStockDto } from './dto/query-movimiento-stock.dto';
import { Permiso } from '../common/decorators/permiso.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types';

// Ledger de entradas/salidas/transferencias de stock. A proposito NO
// tiene PATCH/DELETE -- es un registro de auditoria, para corregir un
// error se carga un movimiento nuevo (ver MovimientosStockService).
// Lectura abierta a cualquier autenticado, alta gateada a Inventario
// (clave interna 'almacen').
@Controller('movimientos-stock')
export class MovimientosStockController {
    constructor(private readonly movimientos: MovimientosStockService) {}

    @Get()
    findAll(@Query() query: QueryMovimientoStockDto) {
        return this.movimientos.findAll(query);
    }

    @Permiso('almacen', 'EDITAR')
    @Post()
    create(@Body() dto: CreateMovimientoStockDto, @CurrentUser() user: JwtPayload) {
        return this.movimientos.create(dto, BigInt(user.sub));
    }
}
