import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { SuperadminGuard } from '../common/guards/superadmin.guard';

@Controller('empresas')
export class EmpresasController {
    constructor(private readonly empresas: EmpresasService) {}

    // Lectura: cualquier autenticado (hace falta para, ej., un selector
    // de empresa al crear un usuario).
    @Get()
    findAll() {
        return this.empresas.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.empresas.findOne(id);
    }

    @UseGuards(SuperadminGuard)
    @Post()
    create(@Body() dto: CreateEmpresaDto) {
        return this.empresas.create(dto);
    }

    @UseGuards(SuperadminGuard)
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateEmpresaDto) {
        return this.empresas.update(id, dto);
    }

    @UseGuards(SuperadminGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.empresas.remove(id);
    }
}
