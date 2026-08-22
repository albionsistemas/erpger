import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateImagenDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    url: string;

    @IsOptional()
    @IsInt()
    orden?: number;
}
