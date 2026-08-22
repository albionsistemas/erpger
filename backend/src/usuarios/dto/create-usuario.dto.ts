import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUsuarioDto {
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    username: string;

    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    nombre?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsBoolean()
    esSuperadmin?: boolean;

    @IsOptional()
    @IsInt()
    empresaId?: number;
}
