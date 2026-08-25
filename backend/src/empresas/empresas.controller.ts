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
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

@Controller('empresas')
export class EmpresasController {
    constructor(private readonly empresas: EmpresasService) {}

    // Lectura: cualquier autenticado (hace falta para, ej., un selector
    // de empresa al crear un usuario). La edicion es del modulo Ajustes.
    @Get()
    findAll() {
        return this.empresas.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.empresas.findOne(id);
    }

    @Permiso('ajustes', 'EDITAR')
    @Post()
    create(@Body() dto: CreateEmpresaDto) {
        return this.empresas.create(dto);
    }

    @Permiso('ajustes', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateEmpresaDto) {
        return this.empresas.update(id, dto);
    }

    @Permiso('ajustes', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.empresas.remove(id);
    }

    @Permiso('ajustes', 'EDITAR')
    @Post(':id/logo')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/empresas',
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
    async uploadLogo(@Param('id', ParseBigIntPipe) id: bigint, @UploadedFile() file: Express.Multer.File) {
        return this.empresas.updateLogo(id, `/uploads/empresas/${file.filename}`);
    }
}
