import { IsBoolean, IsEmail, IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateEmpresaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsOptional()
    @IsBoolean()
    activa?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    cuit?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    direccion?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    ciudad?: string;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    pais?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    telefono?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    web?: string;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    bancoNombre?: string;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    bancoCuenta?: string;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    bancoSucursal?: string;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    bancoCbu?: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    bancoAlias?: string;
}
