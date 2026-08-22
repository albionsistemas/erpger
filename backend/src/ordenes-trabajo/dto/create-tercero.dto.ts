import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTerceroDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    tercero: string;

    @IsOptional()
    @IsDateString()
    fechaInicio?: string;

    @IsOptional()
    @IsDateString()
    fechaEntrega?: string;
}
