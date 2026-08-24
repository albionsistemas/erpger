import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MonedasService } from './monedas.service';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';
import { Permiso } from '../common/decorators/permiso.decorator';

// Catalogo de monedas. La lista incluye la ultima cotizacion de cada una
// (ver MonedasService.findAll) para no obligar al frontend a pedir
// /cotizaciones por separado solo para mostrar el valor vigente.
@Controller('monedas')
export class MonedasController {
    constructor(private readonly monedas: MonedasService) {}

    @Get()
    findAll() {
        return this.monedas.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.monedas.findOne(id);
    }

    @Permiso('compras', 'EDITAR')
    @Post()
    create(@Body() dto: CreateMonedaDto) {
        return this.monedas.create(dto);
    }

    @Permiso('compras', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMonedaDto) {
        return this.monedas.update(id, dto);
    }

    @Permiso('compras', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.monedas.remove(id);
    }
}
