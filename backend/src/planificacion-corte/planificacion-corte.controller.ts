import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { PlanificacionCorteService } from './planificacion-corte.service';
import { CreatePlanificacionDto } from './dto/create-planificacion.dto';
import { UpdatePlanificacionDto } from './dto/update-planificacion.dto';
import { QueryPlanificacionDto } from './dto/query-planificacion.dto';
import { AddItemDto } from './dto/add-item.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

@Permiso('planificacion', 'VER')
@Controller('planificacion-corte')
export class PlanificacionCorteController {
    constructor(private readonly planificacion: PlanificacionCorteService) {}

    @Get()
    findAll(@Query() query: QueryPlanificacionDto) {
        return this.planificacion.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.planificacion.findOne(id);
    }

    @Permiso('planificacion', 'EDITAR')
    @Post()
    create(@Body() dto: CreatePlanificacionDto) {
        return this.planificacion.create(dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdatePlanificacionDto) {
        return this.planificacion.update(id, dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.planificacion.remove(id);
    }

    @Permiso('planificacion', 'EDITAR')
    @Post(':id/items')
    addItem(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: AddItemDto) {
        return this.planificacion.addItem(id, dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Delete(':id/items/:despieceOtId')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeItem(
        @Param('id', ParseBigIntPipe) id: bigint,
        @Param('despieceOtId', ParseBigIntPipe) despieceOtId: bigint,
    ) {
        return this.planificacion.removeItem(id, despieceOtId);
    }
}
