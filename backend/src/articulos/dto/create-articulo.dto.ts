import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
    @MaxLength(150)
    codigoAlbion?: string;

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
    @MaxLength(20)
    estado?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;
}
