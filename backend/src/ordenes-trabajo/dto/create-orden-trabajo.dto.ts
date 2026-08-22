import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrdenTrabajoDto {
    @IsInt()
    ofId: number;

    @IsInt()
    numeroOt: number;

    @IsOptional()
    @IsInt()
    maquinaId?: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    maquinaNombre: string;

    @IsOptional()
    @IsInt()
    cantidad?: number;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    plano?: string;

    @IsDateString()
    fecha: string;

    @IsOptional()
    @IsDateString()
    fechaEjecucion?: string;

    @IsOptional()
    @IsString()
    nota?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    referencia?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    observaciones?: string;

    @IsOptional()
    @IsInt()
    estadoId?: number;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    placa?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    serie?: string;

    @IsOptional()
    @IsString()
    @MaxLength(80)
    motor?: string;

    @IsOptional()
    @IsString()
    @MaxLength(8)
    version?: string;
}
