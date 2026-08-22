import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateModuloDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    @Matches(/^[a-z0-9_-]+$/, { message: 'clave debe ser minuscula, sin espacios (ej: "almacen")' })
    clave: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    nombre: string;
}
