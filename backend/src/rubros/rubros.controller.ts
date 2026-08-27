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
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RubrosService } from './rubros.service';
import { CreateRubroDto } from './dto/create-rubro.dto';
import { UpdateRubroDto } from './dto/update-rubro.dto';
import { Permiso } from '../common/decorators/permiso.decorator';

// Rubros (lineas de producto agricola: Aceitunas, Nueces, etc.), legacy
// rubros_albion. Catalogo compartido: lectura abierta a cualquier
// autenticado (Compras/Ingenieria/Planificacion lo usan en articulos,
// maquinas y OF), CRUD lo administra Ajustes. El GET /catalogos/rubros
// (solo lectura, para los combos existentes) queda intacto.
@Controller('rubros')
export class RubrosController {
    constructor(private readonly rubros: RubrosService) {}

    @Get()
    findAll(@Query('buscar') buscar?: string) {
        return this.rubros.findAll(buscar);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rubros.findOne(id);
    }

    @Permiso('ajustes', 'EDITAR')
    @Post()
    create(@Body() dto: CreateRubroDto) {
        return this.rubros.create(dto);
    }

    @Permiso('ajustes', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRubroDto) {
        return this.rubros.update(id, dto);
    }

    @Permiso('ajustes', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.rubros.remove(id);
    }

    @Permiso('ajustes', 'EDITAR')
    @Post(':id/imagen')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/rubros',
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
    async uploadImagen(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
        return this.rubros.updateImagen(id, `/uploads/rubros/${file.filename}`);
    }
}
