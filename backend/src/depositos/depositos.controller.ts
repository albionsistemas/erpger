import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { DepositosService } from './depositos.service';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { UpdateDepositoDto } from './dto/update-deposito.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types';

// CRUD lo administra Inventario (clave interna 'almacen', ver
// 039_inventario.sql). Lectura abierta a cualquier autenticado --
// Compras/Planificacion van a necesitar listar depositos igual que
// pasa con articulos/operarios.
@Controller('depositos')
export class DepositosController {
    constructor(private readonly depositos: DepositosService) {}

    @Get()
    findAll() {
        return this.depositos.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.depositos.findOne(id);
    }

    @Permiso('almacen', 'EDITAR')
    @Post()
    create(@Body() dto: CreateDepositoDto, @CurrentUser() user: JwtPayload) {
        return this.depositos.create(dto, BigInt(user.sub));
    }

    @Permiso('almacen', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateDepositoDto) {
        return this.depositos.update(id, dto);
    }

    @Permiso('almacen', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.depositos.remove(id);
    }
}
