import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Param, Patch, Post, Query, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { DespieceMaquinasService } from './despiece-maquinas.service';
import { DespiecePdfService } from './pdf/despiece-pdf.service';
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
    constructor(
        private readonly despiece: DespieceMaquinasService,
        private readonly despiecePdf: DespiecePdfService,
    ) {}

    @Get()
    findAll(@Query() query: QueryDespieceDto) {
        return this.despiece.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.despiece.findOne(id);
    }

    // Para Ingenieria: en que otras maquinas se usa un articulo (ver
    // DespieceMaquinasService.usoEnMaquinas -- sin nada de precio).
    @Get('uso-articulo/:articuloId')
    usoEnMaquinas(@Param('articuloId', ParseBigIntPipe) articuloId: bigint) {
        return this.despiece.usoEnMaquinas(articuloId);
    }

    // PDF de impresion por pestana, equivalentes a los botones rojos del
    // legacy (imprimir_lista_general.php / _cortes.php / _compras.php /
    // _pantografo.php / _chapas.php). Lectura abierta, igual que el resto
    // del modulo -- son solo listados, no modifican nada.
    @Get('pdf/general/:plano')
    @Header('Content-Type', 'application/pdf')
    async pdfGeneral(@Param('plano') plano: string, @Res({ passthrough: true }) res: Response) {
        return this.enviarPdf(res, plano, 'general', await this.despiecePdf.general(plano));
    }

    @Get('pdf/corte/:plano')
    @Header('Content-Type', 'application/pdf')
    async pdfCorte(@Param('plano') plano: string, @Res({ passthrough: true }) res: Response) {
        return this.enviarPdf(res, plano, 'corte', await this.despiecePdf.corte(plano));
    }

    @Get('pdf/compras/:plano')
    @Header('Content-Type', 'application/pdf')
    async pdfCompras(@Param('plano') plano: string, @Res({ passthrough: true }) res: Response) {
        return this.enviarPdf(res, plano, 'compras', await this.despiecePdf.compras(plano));
    }

    @Get('pdf/pantografo/:plano')
    @Header('Content-Type', 'application/pdf')
    async pdfPantografo(@Param('plano') plano: string, @Res({ passthrough: true }) res: Response) {
        return this.enviarPdf(res, plano, 'pantografo', await this.despiecePdf.pantografo(plano));
    }

    @Get('pdf/chapas/:plano')
    @Header('Content-Type', 'application/pdf')
    async pdfChapas(@Param('plano') plano: string, @Res({ passthrough: true }) res: Response) {
        return this.enviarPdf(res, plano, 'chapas', await this.despiecePdf.chapas(plano));
    }

    private enviarPdf(res: Response, plano: string, tipo: string, buffer: Buffer): StreamableFile {
        res.set({ 'Content-Disposition': `inline; filename="${tipo}-${plano}.pdf"` });
        return new StreamableFile(buffer);
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
