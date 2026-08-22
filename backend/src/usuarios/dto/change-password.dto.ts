import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
    // Requerida cuando el usuario cambia su propia contrasena. No hace
    // falta cuando un superadmin resetea la contrasena de otro usuario.
    @IsOptional()
    @IsString()
    currentPassword?: string;

    @IsString()
    @MinLength(8)
    @MaxLength(100)
    newPassword: string;
}
