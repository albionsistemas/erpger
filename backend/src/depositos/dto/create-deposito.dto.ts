import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDepositoDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    direccion?: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    empresaIds?: number[];
}
