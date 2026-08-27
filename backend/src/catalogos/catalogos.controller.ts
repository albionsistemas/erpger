import { Controller, Get } from '@nestjs/common';
import { CatalogosService } from './catalogos.service';

@Controller('catalogos')
export class CatalogosController {
    constructor(private readonly catalogos: CatalogosService) {}

    @Get('tipos-orden')
    tiposOrden() {
        return this.catalogos.tiposOrden();
    }

    @Get('estados-of')
    estadosOf() {
        return this.catalogos.estadosOf();
    }

    @Get('estados-ot')
    estadosOt() {
        return this.catalogos.estadosOt();
    }

    @Get('sectores-produccion')
    sectoresProduccion() {
        return this.catalogos.sectoresProduccion();
    }

    @Get('tipos-maquina')
    tiposMaquina() {
        return this.catalogos.tiposMaquina();
    }

    @Get('tipos-cambio-bom')
    tiposCambioBom() {
        return this.catalogos.tiposCambioBom();
    }

    @Get('rubros')
    rubros() {
        return this.catalogos.rubros();
    }

    @Get('motivos-movimiento')
    motivosMovimiento() {
        return this.catalogos.motivosMovimiento();
    }
}
