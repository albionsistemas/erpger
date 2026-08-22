import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryOperarioDto extends PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    sectorId?: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    activo?: boolean;
}
