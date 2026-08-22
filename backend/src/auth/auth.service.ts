import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload, PermisoModulo } from './types';
import { LoginDto } from './dto/login.dto';

const USUARIO_CON_PERMISOS = {
    include: { permisos: { include: { modulo: true } } },
} as const;

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) {}

    async login(dto: LoginDto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { username: dto.username.trim().toLowerCase() },
            ...USUARIO_CON_PERMISOS,
        });

        if (!usuario || !usuario.activo) {
            throw new UnauthorizedException('Usuario o contrasena invalidos');
        }
        if (!usuario.passwordHash) {
            throw new UnauthorizedException('Este usuario todavia no tiene contrasena asignada. Contactar a un administrador.');
        }

        const passwordOk = await bcrypt.compare(dto.password, usuario.passwordHash);
        if (!passwordOk) {
            throw new UnauthorizedException('Usuario o contrasena invalidos');
        }

        const payload = this.toJwtPayload(usuario);
        return {
            accessToken: await this.jwt.signAsync(payload),
            usuario: this.toPublicUsuario(usuario),
        };
    }

    async me(usuarioId: bigint) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            ...USUARIO_CON_PERMISOS,
        });
        if (!usuario) throw new UnauthorizedException();
        return this.toPublicUsuario(usuario);
    }

    private toJwtPayload(usuario: {
        id: bigint;
        username: string;
        esSuperadmin: boolean;
        empresaId: bigint | null;
        permisos: { nivel: string; modulo: { clave: string } }[];
    }): JwtPayload {
        const permisos: PermisoModulo[] = usuario.permisos.map((p) => ({
            moduloClave: p.modulo.clave,
            nivel: p.nivel as PermisoModulo['nivel'],
        }));
        return {
            sub: usuario.id.toString(),
            username: usuario.username,
            esSuperadmin: usuario.esSuperadmin,
            empresaId: usuario.empresaId?.toString() ?? null,
            permisos,
        };
    }

    private toPublicUsuario<T extends { passwordHash: string | null }>(usuario: T) {
        const { passwordHash: _passwordHash, ...rest } = usuario;
        return rest;
    }
}
