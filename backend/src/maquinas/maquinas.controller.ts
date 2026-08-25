import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Param, Patch, Post, Query, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { MaquinasService } from './maquinas.service';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';
import { QueryMaquinaDto } from './dto/query-maquina.dto';
import { ExportMaquinaDto } from './dto/export-maquina.dto';
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

    // Antes de ':id' -- si no, Nest interpreta "export" como el :id.
    @Get('export')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    async export(@Query() query: ExportMaquinaDto, @Res({ passthrough: true }) res: Response) {
        const buffer = await this.maquinas.export(query);
        res.set({ 'Content-Disposition': 'attachment; filename="maquinas.xlsx"' });
        return new StreamableFile(buffer);
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
