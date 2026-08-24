import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSubcategoriaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    nombre: string;

    @Type(() => Number)
    @IsInt()
    categoriaId: number;
}
