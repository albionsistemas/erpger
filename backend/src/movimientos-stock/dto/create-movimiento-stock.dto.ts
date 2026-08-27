import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, ValidateIf } from 'class-validator';
import { TipoMovimientoStock } from '@prisma/client';

export class CreateMovimientoStockDto {
    @IsInt()
    @Type(() => Number)
    depositoId: number;

    // Solo para TRANSFERENCIA -- deposito al que llega el stock.
    @ValidateIf((dto) => dto.tipo === TipoMovimientoStock.TRANSFERENCIA)
    @IsInt()
    @Type(() => Number)
    depositoDestinoId?: number;

    @IsInt()
    @Type(() => Number)
    articuloId: number;

    @IsEnum(TipoMovimientoStock)
    tipo: TipoMovimientoStock;

    @IsNumber()
    @IsPositive()
    cantidad: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    motivoId?: number;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    referencia?: string;

    @IsOptional()
    @IsString()
    nota?: string;
}
