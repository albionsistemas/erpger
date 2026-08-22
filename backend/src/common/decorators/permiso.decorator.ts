import { SetMetadata } from '@nestjs/common';
import { NivelPermiso } from '../../auth/types';

export const PERMISO_KEY = 'permiso';

export interface PermisoRequerido {
    modulo: string;
    nivel: NivelPermiso;
}

// Exige que el usuario autenticado tenga al menos el nivel indicado en
// el modulo indicado (o sea superadmin). Sin este decorador, cualquier
// usuario autenticado puede acceder a la ruta (ej: catalogos compartidos).
export const Permiso = (modulo: string, nivel: NivelPermiso) => SetMetadata(PERMISO_KEY, { modulo, nivel });
