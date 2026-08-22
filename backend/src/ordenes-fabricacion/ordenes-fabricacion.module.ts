import { Module } from '@nestjs/common';
import { OrdenesFabricacionController } from './ordenes-fabricacion.controller';
import { OrdenesFabricacionService } from './ordenes-fabricacion.service';

@Module({
    controllers: [OrdenesFabricacionController],
    providers: [OrdenesFabricacionService],
})
export class OrdenesFabricacionModule {}
