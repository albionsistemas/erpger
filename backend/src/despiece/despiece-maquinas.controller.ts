import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { DespieceMaquinasService } from './despiece-maquinas.service';
import { CreateDespieceMaquinaDto } from './dto/create-despiece-maquina.dto';
import { UpdateDespieceMaquinaDto } from './dto/update-despiece-maquina.dto';
import { QueryDespieceDto } from './dto/query-despiece.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types';

// Catalogo de Ingenieria: Compras (y otros modulos) solo consultan el
// despiece de maquinas para saber que comprar, no lo editan. Mismo
// patron que Articulos/Operarios: lectura abierta a cualquier usuario
// logueado, escritura gateada al modulo dueno.
@Controller('despiece-maquinas')
export class DespieceMaquinasController {
    constructor(private readonly despiece: DespieceMaquinasService) {}

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
    create(@Body() dto: CreateDespieceMaquinaDto, @CurrentUser() user: JwtPayload) {
        return this.despiece.create(dto, BigInt(user.sub));
    }

    @Permiso('ingenieria', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateDespieceMaquinaDto) {
        return this.despiece.update(id, dto);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.despiece.remove(id);
    }

    @Permiso('ingenieria', 'EDITAR')
    @Delete('plano/:plano')
    removeByPlano(@Param('plano') plano: string) {
        return this.despiece.removeByPlano(plano);
    }
}
