import { IsOptional, IsString, MaxLength } from 'class-validator';
import { BaseDespieceItemDto } from './base-despiece-item.dto';

export class CreateDespieceMaquinaDto extends BaseDespieceItemDto {
    // Texto libre del material (legacy: despiecemaquinas.ARTICULO),
    // independiente de articuloId -- ver 023_despiece_maquinas_articulo_texto.sql.
    // Solo despiece_maquinas tiene esta columna por ahora.
    @IsOptional()
    @IsString()
    @MaxLength(255)
    articuloTexto?: string;
}
