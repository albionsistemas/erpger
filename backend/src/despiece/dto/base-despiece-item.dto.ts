import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// Campos compartidos por despiece_maquinas, despiece_ensambles y
// despiece_ot (mismo formato de fila de BOM en las 3 tablas).
export class BaseDespieceItemDto {
    @IsInt()
    item: number;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    plano?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    piezaCodigo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(130)
    denominacion?: string;

    @IsOptional()
    @IsInt()
    articuloId?: number;

    @IsOptional()
    @IsInt()
    anchoMm?: number;

    @IsOptional()
    @IsInt()
    largoMm?: number;

    @IsInt()
    @IsNotEmpty()
    cantidad: number;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    tipoCorte?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    nota?: string;

    @IsOptional()
    @IsBoolean()
    esChapa?: boolean;

    @IsOptional()
    @IsInt()
    cantidadComprar?: number;

    @IsOptional()
    @IsInt()
    metrosLargoTotal?: number;

    @IsOptional()
    @IsInt()
    metrosCantidadTotal?: number;

    @IsOptional()
    @IsInt()
    barrasCantidad?: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    observacionesCorte?: string;

    @IsOptional()
    @IsBoolean()
    esRepuesto?: boolean;

    @IsOptional()
    @IsBoolean()
    verificaStock?: boolean;
}
