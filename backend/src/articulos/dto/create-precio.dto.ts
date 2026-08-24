import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePrecioDto {
    @Type(() => Number)
    @IsNumber()
    precioUsd: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    motivo?: string;
}
