import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ModulosModule } from './modulos/modulos.module';
import { EmpresasModule } from './empresas/empresas.module';
import { ClientesModule } from './clientes/clientes.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { OperariosModule } from './operarios/operarios.module';
import { ArticulosModule } from './articulos/articulos.module';
import { MaquinasModule } from './maquinas/maquinas.module';
import { TiposMaquinaModule } from './tipos-maquina/tipos-maquina.module';
import { OrdenesFabricacionModule } from './ordenes-fabricacion/ordenes-fabricacion.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo/ordenes-trabajo.module';
import { DespieceModule } from './despiece/despiece.module';
import { OtCambiosModule } from './ot-cambios/ot-cambios.module';
import { PlanificacionCorteModule } from './planificacion-corte/planificacion-corte.module';
import { ComprasModule } from './compras/compras.module';
import { RubrosModule } from './rubros/rubros.module';
import { DepositosModule } from './depositos/depositos.module';
import { ExistenciasModule } from './existencias/existencias.module';
import { MovimientosStockModule } from './movimientos-stock/movimientos-stock.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        UsuariosModule,
        ModulosModule,
        EmpresasModule,
        ClientesModule,
        CatalogosModule,
        OperariosModule,
        ArticulosModule,
        MaquinasModule,
        TiposMaquinaModule,
        OrdenesFabricacionModule,
        OrdenesTrabajoModule,
        DespieceModule,
        OtCambiosModule,
        PlanificacionCorteModule,
        ComprasModule,
        RubrosModule,
        DepositosModule,
        ExistenciasModule,
        MovimientosStockModule,
    ],
    providers: [
        // Orden importa: JwtAuthGuard puebla req.user antes de que
        // PermissionsGuard lo necesite.
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: PermissionsGuard },
    ],
})
export class AppModule {}
