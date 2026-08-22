import { PartialType } from '@nestjs/mapped-types';
import { CreateDespieceEnsambleDto } from './create-despiece-ensamble.dto';

export class UpdateDespieceEnsambleDto extends PartialType(CreateDespieceEnsambleDto) {}
