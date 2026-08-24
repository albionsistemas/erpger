import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class QuerySubcategoriaDto {
    @IsOptional()
    @IsString()
    buscar?: string; // busca en nombre

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoriaId?: number;
}
