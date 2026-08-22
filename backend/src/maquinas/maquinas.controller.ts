import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { MaquinasService } from './maquinas.service';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';
import { QueryMaquinaDto } from './dto/query-maquina.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

@Permiso('ingenieria', 'VER')
@Controller('maquinas')
export class MaquinasController {
    constructor(private readonly maquinas: MaquinasService) {}

    @Get()
    findAll(@Query() query: QueryMaquinaDto) {
        return this.maquinas.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.maquinas.findOne(id);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Post()
    create(@Body() dto: CreateMaquinaDto) {
        return this.maquinas.create(dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateMaquinaDto) {
        return this.maquinas.update(id, dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.maquinas.remove(id);
    }
}
