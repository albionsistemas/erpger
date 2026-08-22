import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { QueryUsuarioDto } from './dto/query-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AssignPermisosDto } from './dto/assign-permisos.dto';

const SALT_ROUNDS = 10;

function sinPassword<T extends { passwordHash: string | null }>(usuario: T) {
    const { passwordHash: _passwordHash, ...rest } = usuario;
    return rest;
}

@Injectable()
export class UsuariosService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryUsuarioDto) {
        const where: Prisma.UsuarioWhereInput = {
            ...(query.activo !== undefined ? { activo: query.activo } : {}),
            ...(query.buscar
                ? {
                      OR: [
                          { username: { contains: query.buscar, mode: 'insensitive' } },
                          { nombre: { contains: query.buscar, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [rows, total] = await Promise.all([
            this.prisma.usuario.findMany({
                where,
                include: { permisos: { include: { modulo: true } } },
                orderBy: { username: 'asc' },
                skip: query.skip,
                take: query.limit,
            }),
            this.prisma.usuario.count({ where }),
        ]);

        return { data: rows.map(sinPassword), total, page: query.page, limit: query.limit };
    }

    async findOne(id: bigint) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
            include: { permisos: { include: { modulo: true } } },
        });
        if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
        return sinPassword(usuario);
    }

    async create(dto: CreateUsuarioDto) {
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const { password: _password, empresaId, ...rest } = dto;
        const usuario = await this.prisma.usuario.create({
            data: {
                ...rest,
                username: dto.username.trim().toLowerCase(),
                passwordHash,
                empresaId: empresaId !== undefined ? BigInt(empresaId) : undefined,
            },
        });
        return sinPassword(usuario);
    }

    async update(id: bigint, dto: UpdateUsuarioDto) {
        await this.findOne(id);
        const { empresaId, ...rest } = dto;
        const usuario = await this.prisma.usuario.update({
            where: { id },
            data: { ...rest, empresaId: empresaId !== undefined ? BigInt(empresaId) : undefined },
        });
        return sinPassword(usuario);
    }

    async remove(id: bigint) {
        await this.findOne(id);
        await this.prisma.usuario.delete({ where: { id } });
    }

    async changePassword(id: bigint, actingUserId: bigint, esSuperadmin: boolean, dto: ChangePasswordDto) {
        const usuario = await this.prisma.usuario.findUnique({ where: { id } });
        if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);

        const esUnoMismo = actingUserId === id;
        if (esUnoMismo && !esSuperadmin) {
            if (!dto.currentPassword) {
                throw new BadRequestException('Falta la contrasena actual');
            }
            const actualOk = usuario.passwordHash
                ? await bcrypt.compare(dto.currentPassword, usuario.passwordHash)
                : false;
            if (!actualOk) throw new UnauthorizedException('Contrasena actual incorrecta');
        }
        // Un superadmin puede resetear sin conocer la contrasena actual.

        const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
        await this.prisma.usuario.update({ where: { id }, data: { passwordHash } });
    }

    async updateImagen(id: bigint, imagenUrl: string) {
        await this.findOne(id);
        const usuario = await this.prisma.usuario.update({ where: { id }, data: { imagenUrl } });
        return sinPassword(usuario);
    }

    async assignPermisos(id: bigint, dto: AssignPermisosDto) {
        await this.findOne(id);
        await this.prisma.$transaction([
            this.prisma.usuarioModuloPermiso.deleteMany({ where: { usuarioId: id } }),
            this.prisma.usuarioModuloPermiso.createMany({
                data: dto.permisos.map((p) => ({ usuarioId: id, moduloId: p.moduloId, nivel: p.nivel })),
            }),
        ]);
        return this.findOne(id);
    }
}
