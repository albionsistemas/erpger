import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const MODO_VENTA_LABEL: Record<string, string> = {
  UNITARIO: 'Unidad',
  LINEAL_MM: 'mm (largo)',
  AREA_MM2: 'mm²',
}

interface ExistenciaResumen {
  articuloId: number
  nombre: string
  modoVenta: string | null
  total: string
  stockMinimo: string | null
  alerta: boolean
  porDeposito: { depositoId: number; depositoNombre: string; cantidad: string }[]
}

export function ExistenciasPage() {
  const [items, setItems] = useState<ExistenciaResumen[]>([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [soloAlertas, setSoloAlertas] = useState(false)

  const load = () => {
    setLoading(true)
    apiClient
      .get('/existencias/resumen')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filas = items
    .filter((i) => !soloAlertas || i.alerta)
    .filter((i) => i.nombre.toLowerCase().includes(buscar.toLowerCase()))

  const unidad = (i: ExistenciaResumen) => MODO_VENTA_LABEL[i.modoVenta ?? ''] ?? '-'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Existencias</h1>
        <p className="text-sm text-muted-foreground">
          Total por articulo sumando todos los depositos. El stock minimo se carga desde la ficha del Articulo.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar por nombre..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="max-w-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={soloAlertas} onChange={(e) => setSoloAlertas(e.target.checked)} />
          Solo alertas de stock minimo
        </label>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Articulo</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Stock minimo</TableHead>
              <TableHead>Por deposito</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!loading && filas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
            {filas.map((item) => (
              <TableRow key={item.articuloId}>
                <TableCell className="font-medium">{item.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{unidad(item)}</TableCell>
                <TableCell>{item.total}</TableCell>
                <TableCell className="text-muted-foreground">{item.stockMinimo ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.porDeposito.length > 0
                    ? item.porDeposito.map((d) => `${d.depositoNombre}: ${d.cantidad}`).join(' · ')
                    : '-'}
                </TableCell>
                <TableCell>
                  {item.alerta ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Bajo minimo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">OK</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
