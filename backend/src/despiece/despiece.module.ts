import { Module } from '@nestjs/common';
import { DespieceMaquinasController } from './despiece-maquinas.controller';
import { DespieceMaquinasService } from './despiece-maquinas.service';
import { DespiecePdfService } from './pdf/despiece-pdf.service';
import { DespieceEnsamblesController } from './despiece-ensambles.controller';
import { DespieceEnsamblesService } from './despiece-ensambles.service';
import { DespieceOtController } from './despiece-ot.controller';
import { DespieceOtService } from './despiece-ot.service';

@Module({
    controllers: [DespieceMaquinasController, DespieceEnsamblesController, DespieceOtController],
    providers: [DespieceMaquinasService, DespiecePdfService, DespieceEnsamblesService, DespieceOtService],
})
export class DespieceModule {}
