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
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { QueryClienteDto } from './dto/query-cliente.dto';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types';

const avatarInterceptor = FileInterceptor('file', {
    storage: diskStorage({
        destination: './uploads/contactos',
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
});

@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientes: ClientesService) {}

    @Get()
    findAll(@Query() query: QueryClienteDto) {
        return this.clientes.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.clientes.findOne(id);
    }

    @Permiso('ventas', 'EDITAR')
    @Post()
    create(@Body() dto: CreateClienteDto, @CurrentUser() user: JwtPayload) {
        return this.clientes.create(dto, BigInt(user.sub));
    }

    @Permiso('ventas', 'EDITAR')
    @Patch(':id')
    update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateClienteDto) {
        return this.clientes.update(id, dto);
    }

    @Permiso('ventas', 'EDITAR')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.clientes.remove(id);
    }

    @Permiso('ventas', 'EDITAR')
    @Post(':id/contactos')
    addContacto(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: CreateContactoDto) {
        return this.clientes.addContacto(id, dto);
    }

    @Permiso('ventas', 'EDITAR')
    @Patch(':id/contactos/:contactoId')
    updateContacto(
        @Param('id', ParseBigIntPipe) id: bigint,
        @Param('contactoId', ParseBigIntPipe) contactoId: bigint,
        @Body() dto: UpdateContactoDto,
    ) {
        return this.clientes.updateContacto(id, contactoId, dto);
    }

    @Permiso('ventas', 'EDITAR')
    @Delete(':id/contactos/:contactoId')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeContacto(@Param('id', ParseBigIntPipe) id: bigint, @Param('contactoId', ParseBigIntPipe) contactoId: bigint) {
        return this.clientes.removeContacto(id, contactoId);
    }

    @Permiso('ventas', 'EDITAR')
    @Post(':id/contactos/:contactoId/avatar')
    @UseInterceptors(avatarInterceptor)
    async uploadAvatar(
        @Param('id', ParseBigIntPipe) id: bigint,
        @Param('contactoId', ParseBigIntPipe) contactoId: bigint,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.clientes.updateContactoAvatar(id, contactoId, `/uploads/contactos/${file.filename}`);
    }
}
