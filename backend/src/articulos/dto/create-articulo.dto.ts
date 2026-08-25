import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ModoVenta } from '@prisma/client';

export class CreateArticuloDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    nombre: string;

    @IsOptional()
    @IsInt()
    categoriaId?: number;

    @IsOptional()
    @IsInt()
    subcategoriaId?: number;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    planoPrincipal?: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    denominacionComercial?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    nc?: string;

    @IsOptional()
    @IsInt()
    rubroId?: number;

    @IsOptional()
    @IsIn(['UNITARIO', 'LINEAL_MM', 'AREA_MM2'])
    modoVenta?: ModoVenta;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    imagenUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    pdfUrl?: string;
}
