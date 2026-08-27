import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { RubrosService } from './rubros.service';
import { CreateRubroDto } from './dto/create-rubro.dto';
import { UpdateRubroDto } from './dto/update-rubro.dto';
import { Permiso } from '../common/decorators/permiso.decorator';

// Rubros (lineas de producto agricola: Aceitunas, Nueces, etc.), legacy
// rubros_albion. Catalogo compartido: lectura abierta a cualquier
// autenticado (Compras/Ingenieria/Planificacion lo usan en articulos,
// maquinas y OF), CRUD lo administra Ajustes. El GET /catalogos/rubros
// (solo lectura, para los combos existentes) queda intacto.
@Controller('rubros')
export class RubrosController {
    constructor(private readonly rubros: RubrosService) {}

    @Get()
    findAll(@Query('buscar') buscar?: string) {
        return this.rubros.findAll(buscar);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rubros.findOne(id);
    }

    @Permiso('ajustes', 'EDITAR')
    @Post()
    create(@Body() dto: CreateRubroDto) {
        return this.rubros.create(dto);
    }

    @Permiso('ajustes', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRubroDto) {
        return this.rubros.update(id, dto);
    }

    @Permiso('ajustes', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.rubros.remove(id);
    }
}
