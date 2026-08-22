export type NivelPermiso = 'SIN_ACCESO' | 'VER' | 'EDITAR';

export interface PermisoModulo {
    moduloClave: string;
    nivel: NivelPermiso;
}

// Payload embebido en el JWT. Los permisos viajan como snapshot: un
// cambio de permisos o desactivacion de un usuario se refleja recien en
// su proximo login, no en caliente sobre tokens ya emitidos. Si mas
// adelante hace falta revocacion instantanea, la solucion es acortar el
// vencimiento del token + agregar refresh tokens, no volver a consultar
// la base en cada request.
export interface JwtPayload {
    sub: string; // usuario.id como string (BigInt no es serializable en JWT)
    username: string;
    esSuperadmin: boolean;
    empresaId: string | null; // seam de multi-tenancy, ver db/postgresql/003_empresas.sql
    permisos: PermisoModulo[];
}

const ORDEN_NIVEL: Record<NivelPermiso, number> = {
    SIN_ACCESO: 0,
    VER: 1,
    EDITAR: 2,
};

export function nivelCumple(nivelUsuario: NivelPermiso, nivelRequerido: NivelPermiso): boolean {
    return ORDEN_NIVEL[nivelUsuario] >= ORDEN_NIVEL[nivelRequerido];
}
