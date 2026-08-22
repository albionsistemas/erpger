import { Module } from '@nestjs/common';
import { TiposMaquinaController } from './tipos-maquina.controller';
import { TiposMaquinaService } from './tipos-maquina.service';

@Module({
    controllers: [TiposMaquinaController],
    providers: [TiposMaquinaService],
})
export class TiposMaquinaModule {}
