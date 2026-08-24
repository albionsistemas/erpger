import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { SubcategoriasService } from './subcategorias.service';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { QuerySubcategoriaDto } from './dto/query-subcategoria.dto';
import { Permiso } from '../common/decorators/permiso.decorator';

// Subcategorias de articulos (legacy: agrupadosnivel2), agrupadas por
// Categoria. Mismo criterio de acceso que categorias: lectura abierta,
// CRUD gateado a Compras.
@Controller('subcategorias')
export class SubcategoriasController {
    constructor(private readonly subcategorias: SubcategoriasService) {}

    @Get()
    findAll(@Query() query: QuerySubcategoriaDto) {
        return this.subcategorias.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.subcategorias.findOne(id);
    }

    @Permiso('compras', 'EDITAR')
    @Post()
    create(@Body() dto: CreateSubcategoriaDto) {
        return this.subcategorias.create(dto);
    }

    @Permiso('compras', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubcategoriaDto) {
        return this.subcategorias.update(id, dto);
    }

    @Permiso('compras', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.subcategorias.remove(id);
    }
}
