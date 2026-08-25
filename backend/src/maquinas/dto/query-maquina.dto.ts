import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export const CAMPOS_ORDENABLES_MAQUINA = ['planoId', 'nombre', 'partesCount', 'creadoEn'] as const;
export type CampoOrdenableMaquina = (typeof CAMPOS_ORDENABLES_MAQUINA)[number];

export class QueryMaquinaDto extends PaginationDto {
    @IsOptional()
    @IsString()
    buscar?: string; // busca en nombre y plano_id

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    tipoMaquinaId?: number;

    @IsOptional()
    @IsIn(CAMPOS_ORDENABLES_MAQUINA)
    sortField?: CampoOrdenableMaquina;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}
