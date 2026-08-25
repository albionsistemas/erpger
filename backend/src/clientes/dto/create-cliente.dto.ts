import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClienteDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    razonSocial: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    cuit?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    direccion?: string;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    telefono?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    provincia?: string;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    pais?: string;

    @IsOptional()
    @IsString()
    @MaxLength(180)
    rubro?: string;
}
