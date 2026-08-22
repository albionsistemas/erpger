import { PartialType } from '@nestjs/mapped-types';
import { CreateDespieceOtDto } from './create-despiece-ot.dto';

export class UpdateDespieceOtDto extends PartialType(CreateDespieceOtDto) {}
