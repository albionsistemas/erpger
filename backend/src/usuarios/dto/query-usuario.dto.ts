import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryUsuarioDto extends PaginationDto {
    @IsOptional()
    @IsString()
    buscar?: string; // busca en username y nombre

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    activo?: boolean;
}
