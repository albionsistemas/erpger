import { IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';

export class UpsertEtapaDto {
    @IsBoolean()
    completada: boolean;

    @IsOptional()
    @IsDateString()
    fechaCompletada?: string;

    @IsOptional()
    @IsInt()
    usuarioId?: number;
}
