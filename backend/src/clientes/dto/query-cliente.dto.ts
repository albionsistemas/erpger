import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryClienteDto extends PaginationDto {
    @IsOptional()
    @IsString()
    buscar?: string; // busca en razon_social y cuit
}
