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
import { OperariosService } from './operarios.service';
import { CreateOperarioDto } from './dto/create-operario.dto';
import { UpdateOperarioDto } from './dto/update-operario.dto';
import { QueryOperarioDto } from './dto/query-operario.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

// CRUD lo maneja Ajustes. Lectura abierta a cualquier autenticado (otros
// modulos -ej. Planificacion- necesitan poder listar operarios para
// asignarlos como tecnico/responsable).
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

    @Permiso('ajustes', 'EDITAR')
    @Post()
    create(@Body() dto: CreateOperarioDto) {
        return this.operarios.create(dto);
    }

    @Permiso('ajustes', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateOperarioDto) {
        return this.operarios.update(id, dto);
    }

    @Permiso('ajustes', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.operarios.remove(id);
    }

    @Permiso('ajustes', 'EDITAR')
    @Post(':id/imagen')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/operarios',
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
        return this.operarios.updateImagen(id, `/uploads/operarios/${file.filename}`);
    }
}
