import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { BaseDespieceItemDto } from './base-despiece-item.dto';

export class CreateDespieceOtDto extends BaseDespieceItemDto {
    @IsInt()
    otId: number;

    @IsOptional()
    @IsDateString()
    fechaCorteFinalizado?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    operacion?: string;
}
