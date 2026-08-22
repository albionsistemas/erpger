import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ArticulosService } from './articulos.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { QueryArticuloDto } from './dto/query-articulo.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

// Catalogo compartido entre modulos: el CRUD lo maneja Almacen, pero
// Ingenieria (y otros) necesitan poder listar/ver articulos para
// elegirlos al armar el despiece. Lectura: cualquier usuario logueado.
@Controller('articulos')
export class ArticulosController {
    constructor(private readonly articulos: ArticulosService) {}

    @Get()
    findAll(@Query() query: QueryArticuloDto) {
        return this.articulos.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.articulos.findOne(id);
    }

    @Permiso('almacen', 'EDITAR')
    @Post()
    create(@Body() dto: CreateArticuloDto) {
        return this.articulos.create(dto);
    }

    @Permiso('almacen', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateArticuloDto) {
        return this.articulos.update(id, dto);
    }

    @Permiso('almacen', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.articulos.remove(id);
    }
}
