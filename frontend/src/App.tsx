import { Refine, Authenticated } from '@refinedev/core'
import routerBindings, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from '@refinedev/react-router'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { dataProvider } from './providers/dataProvider'
import { authProvider } from './providers/authProvider'
import { accessControlProvider } from './providers/accessControlProvider'
import { AppLayout } from './layout/AppLayout'
import { LoginPage } from './pages/login/LoginPage'
import {
  OrdenesFabricacionList,
  OrdenesFabricacionCreate,
  OrdenesFabricacionEdit,
  OrdenesFabricacionShow,
} from './pages/ordenes-fabricacion'
import { OrdenesTrabajoList, OrdenesTrabajoCreate, OrdenesTrabajoEdit, OrdenesTrabajoShow } from './pages/ordenes-trabajo'
import { MaquinasList, MaquinasCreate, MaquinasEdit, MaquinasShow } from './pages/maquinas'
import { DespieceMaquinaPage, ArticuloUsoPage } from './pages/despiece-maquinas'
import { LayoutPlaceholder } from './pages/layout/LayoutPlaceholder'
import { TiposMaquinaPage } from './pages/tipos-maquina/TiposMaquinaPage'
import { CategoriasPage } from './pages/compras/CategoriasPage'
import { SubcategoriasPage } from './pages/compras/SubcategoriasPage'
import { MonedasPage } from './pages/compras/MonedasPage'
import { ArticulosList, ArticulosCreate, ArticulosEdit, ArticulosShow } from './pages/articulos'
import { EmpresasPage } from './pages/ajustes/EmpresasPage'

function App() {
  return (
    <BrowserRouter>
      <Refine
        dataProvider={dataProvider}
        routerProvider={routerBindings}
        authProvider={authProvider}
        accessControlProvider={accessControlProvider}
        resources={[
          {
            name: 'ordenes-fabricacion',
            list: '/ordenes-fabricacion',
            create: '/ordenes-fabricacion/nueva',
            edit: '/ordenes-fabricacion/:id/editar',
            show: '/ordenes-fabricacion/:id',
            meta: { label: 'Ordenes de Fabricacion' },
          },
          {
            name: 'ordenes-trabajo',
            list: '/ordenes-trabajo',
            create: '/ordenes-trabajo/nueva',
            edit: '/ordenes-trabajo/:id/editar',
            show: '/ordenes-trabajo/:id',
            meta: { label: 'Ordenes de Trabajo' },
          },
          {
            name: 'maquinas',
            list: '/maquinas',
            create: '/maquinas/nueva',
            edit: '/maquinas/:id/editar',
            show: '/maquinas/:id',
            meta: { label: 'Maquinas' },
          },
          {
            name: 'articulos',
            list: '/articulos',
            create: '/articulos/nuevo',
            edit: '/articulos/:id/editar',
            show: '/articulos/:id',
            meta: { label: 'Articulos' },
          },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          disableTelemetry: true,
          projectId: 'albion-erp-ingenieria',
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <Authenticated key="authenticated-layout" fallback={<CatchAllNavigate to="/login" />}>
                <AppLayout />
              </Authenticated>
            }
          >
            <Route index element={<NavigateToResource resource="ordenes-fabricacion" />} />
            <Route path="/ordenes-fabricacion">
              <Route index element={<OrdenesFabricacionList />} />
              <Route path="nueva" element={<OrdenesFabricacionCreate />} />
              <Route path=":id" element={<OrdenesFabricacionShow />} />
              <Route path=":id/editar" element={<OrdenesFabricacionEdit />} />
            </Route>
            <Route path="/ordenes-trabajo">
              <Route index element={<OrdenesTrabajoList />} />
              <Route path="nueva" element={<OrdenesTrabajoCreate />} />
              <Route path=":id" element={<OrdenesTrabajoShow />} />
              <Route path=":id/editar" element={<OrdenesTrabajoEdit />} />
            </Route>
            <Route path="/maquinas">
              <Route index element={<MaquinasList />} />
              <Route path="nueva" element={<MaquinasCreate />} />
              <Route path=":id" element={<MaquinasShow />} />
              <Route path=":id/editar" element={<MaquinasEdit />} />
              <Route path=":id/despiece" element={<DespieceMaquinaPage />} />
            </Route>
            <Route path="/tipos-maquina" element={<TiposMaquinaPage />} />
            <Route path="/layout" element={<LayoutPlaceholder />} />
            <Route path="/compras/categorias" element={<CategoriasPage />} />
            <Route path="/compras/subcategorias" element={<SubcategoriasPage />} />
            <Route path="/compras/monedas" element={<MonedasPage />} />
            <Route path="/ajustes/empresas" element={<EmpresasPage />} />
            <Route path="/articulos">
              <Route index element={<ArticulosList />} />
              <Route path="nuevo" element={<ArticulosCreate />} />
              <Route path=":id" element={<ArticulosShow />} />
              <Route path=":id/editar" element={<ArticulosEdit />} />
              <Route path=":id/uso-en-maquinas" element={<ArticuloUsoPage />} />
            </Route>
          </Route>
        </Routes>
        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
      </Refine>
    </BrowserRouter>
  )
}

export default App
