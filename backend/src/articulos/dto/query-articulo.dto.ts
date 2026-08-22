import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryArticuloDto extends PaginationDto {
    @IsOptional()
    @IsString()
    buscar?: string; // busca en nombre y codigo_albion

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoriaId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    subcategoriaId?: number;
}
