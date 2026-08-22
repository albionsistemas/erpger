import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { DespieceEnsamblesService } from './despiece-ensambles.service';
import { CreateDespieceEnsambleDto } from './dto/create-despiece-ensamble.dto';
import { UpdateDespieceEnsambleDto } from './dto/update-despiece-ensamble.dto';
import { QueryDespieceDto } from './dto/query-despiece.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

@Permiso('ingenieria', 'VER')
@Controller('despiece-ensambles')
export class DespieceEnsamblesController {
    constructor(private readonly despiece: DespieceEnsamblesService) {}

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
    create(@Body() dto: CreateDespieceEnsambleDto) {
        return this.despiece.create(dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateDespieceEnsambleDto) {
        return this.despiece.update(id, dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.despiece.remove(id);
    }
}
