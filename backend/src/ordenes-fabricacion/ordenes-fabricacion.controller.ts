import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { OrdenesFabricacionService } from './ordenes-fabricacion.service';
import { CreateOrdenFabricacionDto } from './dto/create-orden-fabricacion.dto';
import { UpdateOrdenFabricacionDto } from './dto/update-orden-fabricacion.dto';
import { QueryOrdenFabricacionDto } from './dto/query-orden-fabricacion.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

@Permiso('planificacion', 'VER')
@Controller('ordenes-fabricacion')
export class OrdenesFabricacionController {
    constructor(private readonly ordenesFabricacion: OrdenesFabricacionService) {}

    @Get()
    findAll(@Query() query: QueryOrdenFabricacionDto) {
        return this.ordenesFabricacion.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.ordenesFabricacion.findOne(id);
    }

    @Permiso('planificacion', 'EDITAR')
    @Post()
    create(@Body() dto: CreateOrdenFabricacionDto) {
        return this.ordenesFabricacion.create(dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateOrdenFabricacionDto) {
        return this.ordenesFabricacion.update(id, dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.ordenesFabricacion.remove(id);
    }
}
