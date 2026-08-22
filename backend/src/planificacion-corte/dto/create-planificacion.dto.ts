import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePlanificacionDto {
    @IsInt()
    otId: number;

    @IsDateString()
    fechaInicio: string;

    @IsDateString()
    fechaEntrega: string;

    @IsOptional()
    @IsInt()
    operarioId?: number;

    @IsOptional()
    @IsString()
    @MaxLength(250)
    nota?: string;
}
