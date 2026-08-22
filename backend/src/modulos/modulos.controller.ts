import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ModulosService } from './modulos.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { SuperadminGuard } from '../common/guards/superadmin.guard';

@Controller('modulos')
export class ModulosController {
    constructor(private readonly modulos: ModulosService) {}

    // Lectura: cualquier usuario autenticado (se necesita para armar el
    // menu lateral y la pantalla de asignacion de permisos).
    @Get()
    findAll() {
        return this.modulos.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.modulos.findOne(id);
    }

    @UseGuards(SuperadminGuard)
    @Post()
    create(@Body() dto: CreateModuloDto) {
        return this.modulos.create(dto);
    }

    @UseGuards(SuperadminGuard)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuloDto) {
        return this.modulos.update(id, dto);
    }

    @UseGuards(SuperadminGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.modulos.remove(id);
    }
}
