import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { OperariosService } from './operarios.service';
import { CreateOperarioDto } from './dto/create-operario.dto';
import { UpdateOperarioDto } from './dto/update-operario.dto';
import { QueryOperarioDto } from './dto/query-operario.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

// CRUD lo maneja Recursos Humanos. Lectura abierta a cualquier
// autenticado (otros modulos -ej. Planificacion- necesitan poder listar
// operarios para asignarlos como tecnico/responsable).
@Controller('operarios')
export class OperariosController {
    constructor(private readonly operarios: OperariosService) {}

    @Get()
    findAll(@Query() query: QueryOperarioDto) {
        return this.operarios.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.operarios.findOne(id);
    }

    @Permiso('rrhh', 'EDITAR')
    @Post()
    create(@Body() dto: CreateOperarioDto) {
        return this.operarios.create(dto);
    }

    @Permiso('rrhh', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateOperarioDto) {
        return this.operarios.update(id, dto);
    }

    @Permiso('rrhh', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.operarios.remove(id);
    }
}
