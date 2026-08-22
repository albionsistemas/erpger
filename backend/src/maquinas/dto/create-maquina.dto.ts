import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMaquinaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    planoId: string;

    @IsOptional()
    @IsInt()
    tipoMaquinaId?: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    nombre: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    detalle?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    usos?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    tipoHierro?: string;

    @IsOptional()
    @IsInt()
    anchoMm?: number;

    @IsOptional()
    @IsInt()
    largoMm?: number;

    @IsOptional()
    @IsInt()
    altoMm?: number;

    @IsOptional()
    @IsInt()
    anchoUtilMm?: number;

    @IsOptional()
    @IsInt()
    largoUtilMm?: number;

    @IsOptional()
    @IsInt()
    diametroMm?: number;

    @IsOptional()
    @IsInt()
    capacidad?: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    imagenUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    pdfUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    dxfUrl?: string;

    @IsOptional()
    @IsNumber()
    precioLista?: number;

    @IsOptional()
    @IsString()
    @MaxLength(3)
    moneda?: string;
}
