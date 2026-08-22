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
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { QueryUsuarioDto } from './dto/query-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AssignPermisosDto } from './dto/assign-permisos.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { SuperadminGuard } from '../common/guards/superadmin.guard';
import { SelfOrSuperadminGuard } from '../common/guards/self-or-superadmin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types';

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuarios: UsuariosService) {}

    // Lectura abierta a cualquier autenticado (no expone passwordHash):
    // hace falta para selects de vendedor/revisor/etc en otros modulos.
    @Get()
    findAll(@Query() query: QueryUsuarioDto) {
        return this.usuarios.findAll(query);
    }

    @UseGuards(SelfOrSuperadminGuard)
    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.usuarios.findOne(id);
    }

    @UseGuards(SuperadminGuard)
    @Post()
    create(@Body() dto: CreateUsuarioDto) {
        return this.usuarios.create(dto);
    }

    @UseGuards(SuperadminGuard)
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateUsuarioDto) {
        return this.usuarios.update(id, dto);
    }

    @UseGuards(SuperadminGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.usuarios.remove(id);
    }

    @UseGuards(SuperadminGuard)
    @Put(':id/permisos')
    assignPermisos(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: AssignPermisosDto) {
        return this.usuarios.assignPermisos(id, dto);
    }

    @UseGuards(SelfOrSuperadminGuard)
    @Patch(':id/password')
    changePassword(
        @Param('id', ParseBigIntPipe) id: bigint,
        @CurrentUser() actingUser: JwtPayload,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.usuarios.changePassword(id, BigInt(actingUser.sub), actingUser.esSuperadmin, dto);
    }

    @UseGuards(SelfOrSuperadminGuard)
    @Post(':id/imagen')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/perfiles',
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
        return this.usuarios.updateImagen(id, `/uploads/perfiles/${file.filename}`);
    }
}
