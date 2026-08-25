import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateContactoDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    nombre: string;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    cargo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    telefono?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    orden?: number;
}
