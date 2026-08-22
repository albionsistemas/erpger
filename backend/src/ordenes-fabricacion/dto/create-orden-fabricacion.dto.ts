import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrdenFabricacionDto {
    @IsInt()
    numeroOf: number;

    @IsInt()
    tipoOrdenId: number;

    @IsOptional()
    @IsInt()
    clienteId?: number;

    @IsDateString()
    fecha: string;

    @IsOptional()
    @IsDateString()
    fechaEntrega?: string;

    @IsOptional()
    @IsInt()
    rubroId?: number;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    referencia?: string;

    @IsOptional()
    @IsString()
    nota?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    layoutUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    pautasUrl?: string;

    @IsOptional()
    @IsInt()
    vendedorId?: number;

    @IsInt()
    @IsNotEmpty()
    estadoId: number;
}
