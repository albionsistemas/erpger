import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { SubcategoriasController } from './subcategorias.controller';
import { SubcategoriasService } from './subcategorias.service';
import { MonedasController } from './monedas.controller';
import { MonedasService } from './monedas.service';
import { CotizacionesController } from './cotizaciones.controller';
import { CotizacionesService } from './cotizaciones.service';

@Module({
    controllers: [CategoriasController, SubcategoriasController, MonedasController, CotizacionesController],
    providers: [CategoriasService, SubcategoriasService, MonedasService, CotizacionesService],
})
export class ComprasModule {}
