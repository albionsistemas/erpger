import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryPlanificacionDto extends PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    otId?: number;
}
