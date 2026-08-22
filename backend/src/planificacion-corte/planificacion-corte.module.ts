import { Module } from '@nestjs/common';
import { PlanificacionCorteController } from './planificacion-corte.controller';
import { PlanificacionCorteService } from './planificacion-corte.service';

@Module({
    controllers: [PlanificacionCorteController],
    providers: [PlanificacionCorteService],
})
export class PlanificacionCorteModule {}
