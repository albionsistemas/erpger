import { PartialType } from '@nestjs/mapped-types';
import { CreateDespieceMaquinaDto } from './create-despiece-maquina.dto';

export class UpdateDespieceMaquinaDto extends PartialType(CreateDespieceMaquinaDto) {}
