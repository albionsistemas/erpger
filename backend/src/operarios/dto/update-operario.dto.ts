import { PartialType } from '@nestjs/mapped-types';
import { CreateOperarioDto } from './create-operario.dto';

export class UpdateOperarioDto extends PartialType(CreateOperarioDto) {}
