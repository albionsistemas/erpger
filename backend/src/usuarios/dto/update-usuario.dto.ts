import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

// password se cambia por un endpoint dedicado, no por este PATCH generico.
export class UpdateUsuarioDto extends PartialType(OmitType(CreateUsuarioDto, ['password'] as const)) {
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
