import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryMaquinaDto extends PaginationDto {
    @IsOptional()
    @IsString()
    buscar?: string; // busca en nombre y plano_id

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    tipoMaquinaId?: number;
}
