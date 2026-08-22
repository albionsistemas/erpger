import { Module } from '@nestjs/common';
import { OtCambiosController } from './ot-cambios.controller';
import { OtCambiosService } from './ot-cambios.service';

@Module({
    controllers: [OtCambiosController],
    providers: [OtCambiosService],
})
export class OtCambiosModule {}
