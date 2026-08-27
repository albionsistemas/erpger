import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { TipoMovimientoStock } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryMovimientoStockDto extends PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    depositoId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    articuloId?: number;

    @IsOptional()
    @IsEnum(TipoMovimientoStock)
    tipo?: TipoMovimientoStock;

    @IsOptional()
    @IsDateString()
    desde?: string;

    @IsOptional()
    @IsDateString()
    hasta?: string;
}
