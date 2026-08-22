import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTipoMaquinaDto {
    @IsOptional()
    @IsString()
    @MaxLength(10)
    codigo?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    nombre: string;
}
