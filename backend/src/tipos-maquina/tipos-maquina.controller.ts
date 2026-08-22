import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { TiposMaquinaService } from './tipos-maquina.service';
import { CreateTipoMaquinaDto } from './dto/create-tipo-maquina.dto';
import { UpdateTipoMaquinaDto } from './dto/update-tipo-maquina.dto';
import { Permiso } from '../common/decorators/permiso.decorator';

@Permiso('ingenieria', 'VER')
@Controller('tipos-maquina')
export class TiposMaquinaController {
    constructor(private readonly tiposMaquina: TiposMaquinaService) {}

    @Get()
    findAll() {
        return this.tiposMaquina.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tiposMaquina.findOne(id);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Post()
    create(@Body() dto: CreateTipoMaquinaDto) {
        return this.tiposMaquina.create(dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoMaquinaDto) {
        return this.tiposMaquina.update(id, dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tiposMaquina.remove(id);
    }
}
