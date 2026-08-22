import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { CanActivate } from '@nestjs/common/interfaces';
import { JwtPayload } from '../../auth/types';

// Permite la accion si el usuario autenticado es superadmin, o si el
// :id de la ruta es su propio usuario (ej: cambiar su propia contrasena
// o su propia foto de perfil).
@Injectable()
export class SelfOrSuperadminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user: JwtPayload | undefined = request.user;
        const targetId = request.params?.id;

        if (!user) return false;
        if (user.esSuperadmin) return true;
        if (targetId !== undefined && user.sub === targetId) return true;

        throw new ForbiddenException('Solo podes hacer esto sobre tu propio usuario');
    }
}
