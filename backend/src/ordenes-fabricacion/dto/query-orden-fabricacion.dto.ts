import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryOrdenFabricacionDto extends PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    clienteId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    estadoId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    tipoOrdenId?: number;

    @IsOptional()
    @IsDateString()
    fechaDesde?: string;

    @IsOptional()
    @IsDateString()
    fechaHasta?: string;

    @IsOptional()
    @IsString()
    buscar?: string; // busca en referencia y nota
}
