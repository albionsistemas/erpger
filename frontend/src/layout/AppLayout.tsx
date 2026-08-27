import { Outlet, Link, useLocation } from 'react-router-dom'
import { useLogout, useGetIdentity } from '@refinedev/core'
import { FileText, ClipboardList, Cog, Tags, LayoutGrid, LogOut, Boxes, ListTree, DollarSign, Package, Building2, Users, Sprout, HardHat, Warehouse, PackageSearch, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getCurrentPayload } from '@/auth/token-storage'
import { nivelCumple } from '@/auth/types'

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  modulo: string
}

// Ingenieria = maquinas/BOM/layout/tecnico. Planificacion = OF/OT
// (cuando y quien las ejecuta). RRHH se suma como grupo nuevo cuando
// se construya. "Layout" apunta a una pantalla placeholder (ver
// pages/layout) hasta que definamos el modelo de datos (equivalente
// al legacy 'lineas'). "Inventario" usa la clave interna 'almacen'
// (el modulo ya estaba seedeado sin pantallas atras, ver 039_inventario.sql
// -- solo cambio el nombre visible, no la clave).
const NAV: { grupo: string; items: NavItem[] }[] = [
  {
    grupo: 'Ingenieria',
    items: [
      { label: 'Maquinas', to: '/maquinas', icon: Cog, modulo: 'ingenieria' },
      { label: 'Tipo de Maquinas', to: '/tipos-maquina', icon: Tags, modulo: 'ingenieria' },
      { label: 'Layout', to: '/layout', icon: LayoutGrid, modulo: 'ingenieria' },
    ],
  },
  {
    grupo: 'Planificacion',
    items: [
      { label: 'Ordenes de Fabricacion (630)', to: '/ordenes-fabricacion', icon: FileText, modulo: 'planificacion' },
      { label: 'Ordenes de Trabajo', to: '/ordenes-trabajo', icon: ClipboardList, modulo: 'planificacion' },
    ],
  },
  {
    grupo: 'Ventas',
    items: [{ label: 'Clientes', to: '/ventas/clientes', icon: Users, modulo: 'ventas' }],
  },
  {
    grupo: 'Compras',
    items: [
      { label: 'Categorias', to: '/compras/categorias', icon: Boxes, modulo: 'compras' },
      { label: 'Subcategorias', to: '/compras/subcategorias', icon: ListTree, modulo: 'compras' },
      { label: 'Monedas', to: '/compras/monedas', icon: DollarSign, modulo: 'compras' },
      { label: 'Articulos', to: '/articulos', icon: Package, modulo: 'compras' },
    ],
  },
  {
    grupo: 'Inventario',
    items: [
      { label: 'Depositos', to: '/inventario/depositos', icon: Warehouse, modulo: 'almacen' },
      { label: 'Existencias', to: '/inventario/existencias', icon: PackageSearch, modulo: 'almacen' },
      { label: 'Movimientos', to: '/inventario/movimientos', icon: ArrowLeftRight, modulo: 'almacen' },
    ],
  },
  {
    grupo: 'Ajustes',
    items: [
      { label: 'Empresas', to: '/ajustes/empresas', icon: Building2, modulo: 'ajustes' },
      { label: 'Rubros', to: '/ajustes/rubros', icon: Sprout, modulo: 'ajustes' },
      { label: 'Operarios', to: '/operarios', icon: HardHat, modulo: 'ajustes' },
    ],
  },
]

function puedeVer(modulo: string): boolean {
  const payload = getCurrentPayload()
  if (!payload) return false
  if (payload.esSuperadmin) return true
  const permiso = payload.permisos.find((p) => p.moduloClave === modulo)
  return nivelCumple(permiso?.nivel ?? 'SIN_ACCESO', 'VER')
}

export function AppLayout() {
  const location = useLocation()
  const { mutate: logout } = useLogout()
  const { data: identity } = useGetIdentity<{ name: string; esSuperadmin: boolean }>()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold">ERP Albion</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {NAV.map((grupo) => {
            const items = grupo.items.filter((item) => puedeVer(item.modulo))
            if (items.length === 0) return null
            return (
              <div key={grupo.grupo} className="mb-4">
                <p className="mb-1 px-2 text-xs font-semibold uppercase text-muted-foreground">{grupo.grupo}</p>
                {items.map((item) => {
                  const Icon = item.icon
                  const active = location.pathname.startsWith(item.to)
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
                        active && 'bg-accent font-medium',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {identity?.name}
              {identity?.esSuperadmin && ' (superadmin)'}
            </span>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Cerrar sesion">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
