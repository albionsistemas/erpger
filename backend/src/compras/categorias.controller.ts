import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Permiso } from '../common/decorators/permiso.decorator';

// Categorias de articulos (legacy: tiposdearticulos). Catalogo compartido:
// lectura abierta a cualquier autenticado (Ingenieria/otros la necesitan
// para elegir articulos al armar el despiece), CRUD lo administra Compras.
@Controller('categorias')
export class CategoriasController {
    constructor(private readonly categorias: CategoriasService) {}

    @Get()
    findAll(@Query('buscar') buscar?: string) {
        return this.categorias.findAll(buscar);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categorias.findOne(id);
    }

    @Permiso('compras', 'EDITAR')
    @Post()
    create(@Body() dto: CreateCategoriaDto) {
        return this.categorias.create(dto);
    }

    @Permiso('compras', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoriaDto) {
        return this.categorias.update(id, dto);
    }

    @Permiso('compras', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categorias.remove(id);
    }
}
