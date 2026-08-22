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
import { LayoutPlaceholder } from './pages/layout/LayoutPlaceholder'
import { TiposMaquinaPage } from './pages/tipos-maquina/TiposMaquinaPage'

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
            </Route>
            <Route path="/tipos-maquina" element={<TiposMaquinaPage />} />
            <Route path="/layout" element={<LayoutPlaceholder />} />
          </Route>
        </Routes>
        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
      </Refine>
    </BrowserRouter>
  )
}

export default App
