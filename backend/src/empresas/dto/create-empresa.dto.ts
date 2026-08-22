import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEmpresaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsOptional()
    @IsBoolean()
    activa?: boolean;
}
