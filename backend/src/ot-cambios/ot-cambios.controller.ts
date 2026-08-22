import { Controller, Get, Param, Query } from '@nestjs/common';
import { OtCambiosService } from './ot-cambios.service';
import { QueryOtCambioDto } from './dto/query-ot-cambio.dto';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { Permiso } from '../common/decorators/permiso.decorator';

@Permiso('ingenieria', 'VER')
@Controller('ot-cambios')
export class OtCambiosController {
    constructor(private readonly otCambios: OtCambiosService) {}

    @Get()
    findAll(@Query() query: QueryOtCambioDto) {
        return this.otCambios.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseBigIntPipe) id: bigint) {
        return this.otCambios.findOne(id);
    }
}
