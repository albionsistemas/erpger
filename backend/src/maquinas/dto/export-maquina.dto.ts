import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { CAMPOS_ORDENABLES_MAQUINA, CampoOrdenableMaquina } from './query-maquina.dto';

// Mismos filtros/orden que QueryMaquinaDto pero sin paginado -- la
// exportacion siempre trae todas las filas que matchean.
export class ExportMaquinaDto {
    @IsOptional()
    @IsString()
    buscar?: string;

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
