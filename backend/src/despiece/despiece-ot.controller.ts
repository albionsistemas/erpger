import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { DespieceOtService } from './despiece-ot.service';
import { CreateDespieceOtDto } from './dto/create-despiece-ot.dto';
import { UpdateDespieceOtDto } from './dto/update-despiece-ot.dto';
import { QueryDespieceOtDto } from './dto/query-despiece.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

@Permiso('ingenieria', 'VER')
@Controller('despiece-ot')
export class DespieceOtController {
    constructor(private readonly despiece: DespieceOtService) {}

    @Get()
    findAll(@Query() query: QueryDespieceOtDto) {
        return this.despiece.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.despiece.findOne(id);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Post()
    create(@Body() dto: CreateDespieceOtDto) {
        return this.despiece.create(dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateDespieceOtDto) {
        return this.despiece.update(id, dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.despiece.remove(id);
    }
}
