import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTareaDto {
    @IsInt()
    sectorId: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombreTarea: string;

    @IsOptional()
    @IsDateString()
    fechaInicio?: string;

    @IsOptional()
    @IsDateString()
    fechaTerminacion?: string;

    @IsOptional()
    @IsInt()
    operarioId?: number;
}
