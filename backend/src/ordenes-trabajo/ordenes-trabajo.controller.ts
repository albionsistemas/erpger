import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { QueryOrdenTrabajoDto } from './dto/query-orden-trabajo.dto';
import { UpsertEtapaDto } from './dto/upsert-etapa.dto';
import { CreateTerceroDto } from './dto/create-tercero.dto';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

@Permiso('planificacion', 'VER')
@Controller('ordenes-trabajo')
export class OrdenesTrabajoController {
    constructor(private readonly ordenesTrabajo: OrdenesTrabajoService) {}

    @Get()
    findAll(@Query() query: QueryOrdenTrabajoDto) {
        return this.ordenesTrabajo.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.ordenesTrabajo.findOne(id);
    }

    @Permiso('planificacion', 'EDITAR')
    @Post()
    create(@Body() dto: CreateOrdenTrabajoDto) {
        return this.ordenesTrabajo.create(dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateOrdenTrabajoDto) {
        return this.ordenesTrabajo.update(id, dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.ordenesTrabajo.remove(id);
    }

    // -------------------------------------------------------------
    // Etapas
    // -------------------------------------------------------------

    @Get(':id/etapas')
    findEtapas(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.ordenesTrabajo.findEtapas(id);
    }

    @Permiso('planificacion', 'EDITAR')
    @Patch(':id/etapas/:sectorId')
    upsertEtapa(
        @Param('id', ParseBigIntPipe) id: bigint,
        @Param('sectorId', ParseIntPipe) sectorId: number,
        @Body() dto: UpsertEtapaDto,
    ) {
        return this.ordenesTrabajo.upsertEtapa(id, sectorId, dto);
    }

    // -------------------------------------------------------------
    // Terceros
    // -------------------------------------------------------------

    @Get(':id/terceros')
    findTerceros(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.ordenesTrabajo.findTerceros(id);
    }

    @Permiso('planificacion', 'EDITAR')
    @Post(':id/terceros')
    addTercero(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: CreateTerceroDto) {
        return this.ordenesTrabajo.addTercero(id, dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Patch(':id/terceros/:terceroId')
    updateTercero(
        @Param('id', ParseBigIntPipe) id: bigint,
        @Param('terceroId', ParseBigIntPipe) terceroId: bigint,
        @Body() dto: CreateTerceroDto,
    ) {
        return this.ordenesTrabajo.updateTercero(id, terceroId, dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Delete(':id/terceros/:terceroId')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeTercero(@Param('id', ParseBigIntPipe) id: bigint, @Param('terceroId', ParseBigIntPipe) terceroId: bigint) {
        return this.ordenesTrabajo.removeTercero(id, terceroId);
    }

    // -------------------------------------------------------------
    // Imagenes
    // -------------------------------------------------------------

    @Get(':id/imagenes')
    findImagenes(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.ordenesTrabajo.findImagenes(id);
    }

    @Permiso('planificacion', 'EDITAR')
    @Post(':id/imagenes')
    addImagen(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: CreateImagenDto) {
        return this.ordenesTrabajo.addImagen(id, dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Delete(':id/imagenes/:imagenId')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeImagen(@Param('id', ParseBigIntPipe) id: bigint, @Param('imagenId', ParseBigIntPipe) imagenId: bigint) {
        return this.ordenesTrabajo.removeImagen(id, imagenId);
    }

    // -------------------------------------------------------------
    // Tareas
    // -------------------------------------------------------------

    @Get(':id/tareas')
    findTareas(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.ordenesTrabajo.findTareas(id);
    }

    @Permiso('planificacion', 'EDITAR')
    @Post(':id/tareas')
    addTarea(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: CreateTareaDto) {
        return this.ordenesTrabajo.addTarea(id, dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Patch(':id/tareas/:tareaId')
    updateTarea(
        @Param('id', ParseBigIntPipe) id: bigint,
        @Param('tareaId', ParseBigIntPipe) tareaId: bigint,
        @Body() dto: UpdateTareaDto,
    ) {
        return this.ordenesTrabajo.updateTarea(id, tareaId, dto);
    }

    @Permiso('planificacion', 'EDITAR')
    @Delete(':id/tareas/:tareaId')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeTarea(@Param('id', ParseBigIntPipe) id: bigint, @Param('tareaId', ParseBigIntPipe) tareaId: bigint) {
        return this.ordenesTrabajo.removeTarea(id, tareaId);
    }
}
