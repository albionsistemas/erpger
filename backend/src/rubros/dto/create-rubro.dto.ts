import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRubroDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    nombre: string;
}
