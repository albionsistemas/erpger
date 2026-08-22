import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, ValidateNested } from 'class-validator';
import { NivelPermiso } from '../../auth/types';

class PermisoModuloDto {
    @IsInt()
    moduloId: number;

    @IsEnum(['SIN_ACCESO', 'VER', 'EDITAR'])
    nivel: NivelPermiso;
}

export class AssignPermisosDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermisoModuloDto)
    permisos: PermisoModuloDto[];
}
