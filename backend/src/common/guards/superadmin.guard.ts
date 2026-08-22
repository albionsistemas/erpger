import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { CanActivate } from '@nestjs/common/interfaces';
import { JwtPayload } from '../../auth/types';

// Para operaciones de administracion de usuarios (crear cuentas, asignar
// permisos, dar de baja). No depende de @Permiso() / modulos de negocio.
@Injectable()
export class SuperadminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user: JwtPayload | undefined = request.user;
        if (!user?.esSuperadmin) {
            throw new ForbiddenException('Requiere permisos de superadmin');
        }
        return true;
    }
}
