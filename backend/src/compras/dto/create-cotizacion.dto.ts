import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreateCotizacionDto {
    @Type(() => Number)
    @IsInt()
    monedaId: number;

    @Type(() => Number)
    @IsNumber()
    tasaCambio: number;

    @IsOptional()
    @IsIn(['MANUAL', 'BNA_AUTO'])
    fuente?: string;
}
