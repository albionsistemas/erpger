import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ArticulosService } from './articulos.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { QueryArticuloDto } from './dto/query-articulo.dto';
import { CreatePrecioDto } from './dto/create-precio.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types';

// Catalogo compartido entre modulos: el CRUD lo maneja Compras, pero
// Ingenieria (y otros) necesitan poder listar/ver articulos para
// elegirlos al armar el despiece. Lectura: cualquier usuario logueado.
@Controller('articulos')
export class ArticulosController {
    constructor(private readonly articulos: ArticulosService) {}

    @Get()
    findAll(@Query() query: QueryArticuloDto) {
        return this.articulos.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.articulos.findOne(id);
    }

    @Permiso('compras', 'EDITAR')
    @Post()
    create(@Body() dto: CreateArticuloDto) {
        return this.articulos.create(dto);
    }

    @Permiso('compras', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateArticuloDto) {
        return this.articulos.update(id, dto);
    }

    @Permiso('compras', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.articulos.remove(id);
    }

    // Historial de precio en USD: bitacora, solo lectura + alta (ver
    // comentario en ArticulosService).
    @Get(':id/precios')
    listPrecios(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.articulos.listPrecios(id);
    }

    @Permiso('compras', 'EDITAR')
    @Post(':id/precios')
    addPrecio(
        @Param('id', ParseBigIntPipe) id: bigint,
        @Body() dto: CreatePrecioDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.articulos.addPrecio(id, dto, BigInt(user.sub));
    }

    @Permiso('compras', 'EDITAR')
    @Post(':id/imagen')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/articulos',
                filename: (_req, file, cb) => {
                    const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
                    cb(null, nombreUnico);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
            fileFilter: (_req, file, cb) => {
                if (!file.mimetype.startsWith('image/')) {
                    cb(new Error('El archivo debe ser una imagen'), false);
                    return;
                }
                cb(null, true);
            },
        }),
    )
    async uploadImagen(@Param('id', ParseBigIntPipe) id: bigint, @UploadedFile() file: Express.Multer.File) {
        return this.articulos.updateImagen(id, `/uploads/articulos/${file.filename}`);
    }
}
