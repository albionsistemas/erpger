import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { DespieceMaquinasService } from './despiece-maquinas.service';
import { CreateDespieceMaquinaDto } from './dto/create-despiece-maquina.dto';
import { UpdateDespieceMaquinaDto } from './dto/update-despiece-maquina.dto';
import { QueryDespieceDto } from './dto/query-despiece.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

@Permiso('ingenieria', 'VER')
@Controller('despiece-maquinas')
export class DespieceMaquinasController {
    constructor(private readonly despiece: DespieceMaquinasService) {}

    @Get()
    findAll(@Query() query: QueryDespieceDto) {
        return this.despiece.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.despiece.findOne(id);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Post()
    create(@Body() dto: CreateDespieceMaquinaDto) {
        return this.despiece.create(dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateDespieceMaquinaDto) {
        return this.despiece.update(id, dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.despiece.remove(id);
    }
}
