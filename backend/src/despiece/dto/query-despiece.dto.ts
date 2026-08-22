import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryDespieceDto extends PaginationDto {
    @IsOptional()
    @IsString()
    plano?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    articuloId?: number;
}

export class QueryDespieceOtDto extends QueryDespieceDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    otId?: number;
}
