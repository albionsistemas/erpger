import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { CanActivate } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { PERMISO_KEY, PermisoRequerido } from '../decorators/permiso.decorator';
import { JwtPayload, nivelCumple } from '../../auth/types';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requerido = this.reflector.getAllAndOverride<PermisoRequerido | undefined>(PERMISO_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requerido) return true; // ruta sin @Permiso(): alcanza con estar autenticado

        const request = context.switchToHttp().getRequest();
        const user: JwtPayload | undefined = request.user;
        if (!user) return false; // no deberia pasar (JwtAuthGuard corre antes), defensivo

        if (user.esSuperadmin) return true;

        const permiso = user.permisos.find((p) => p.moduloClave === requerido.modulo);
        const nivelUsuario = permiso?.nivel ?? 'SIN_ACCESO';
        if (!nivelCumple(nivelUsuario, requerido.nivel)) {
            throw new ForbiddenException(
                `No tenes permiso de "${requerido.nivel}" en el modulo "${requerido.modulo}"`,
            );
        }
        return true;
    }
}
