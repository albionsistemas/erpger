import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMonedaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(3)
    codigoIso: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    nombre: string;

    @IsOptional()
    @IsString()
    @MaxLength(5)
    simbolo?: string;

    @IsOptional()
    @IsBoolean()
    activa?: boolean;
}
