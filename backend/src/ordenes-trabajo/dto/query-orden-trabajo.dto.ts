import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryOrdenTrabajoDto extends PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    ofId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    estadoId?: number;

    @IsOptional()
    @IsString()
    buscar?: string; // busca en maquina_nombre y referencia
}
