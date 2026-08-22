import { useShow } from '@refinedev/core'
import { useParams, Link } from 'react-router-dom'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface OrdenTrabajoRow {
  id: number
  numeroOt: number
  maquinaNombre: string
  cantidad: number
  fecha: string
  estado: { nombre: string } | null
  maquina: { nombre: string } | null
}

interface OrdenFabricacionDetalle {
  id: number
  numeroOf: number
  fecha: string
  fechaEntrega: string | null
  referencia: string | null
  nota: string | null
  tipoOrden: { nombre: string }
  estado: { nombre: string }
  cliente: { razonSocial: string } | null
  rubro: { nombre: string } | null
  vendedor: { username: string; nombre: string | null } | null
  ordenesTrabajo: OrdenTrabajoRow[]
}

export function OrdenesFabricacionShow() {
  const { id } = useParams()
  const { result, query } = useShow<OrdenFabricacionDetalle>({ resource: 'ordenes-fabricacion', id: Number(id) })

  if (query.isLoading) return <p className="text-muted-foreground">Cargando...</p>
  if (!result) return <p className="text-muted-foreground">No encontrada</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">OF {result.numeroOf}</h1>
        <Button asChild variant="outline">
          <Link to={`/ordenes-fabricacion/${result.id}/editar`}>
            <Pencil />
            Editar
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid grid-cols-3 gap-4 pt-6 text-sm">
          <div>
            <p className="text-muted-foreground">Tipo</p>
            <p className="font-medium">{result.tipoOrden?.nombre}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estado</p>
            <Badge variant="secondary">{result.estado?.nombre}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Cliente</p>
            <p className="font-medium">{result.cliente?.razonSocial ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha</p>
            <p className="font-medium">{result.fecha?.slice(0, 10)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Entrega</p>
            <p className="font-medium">{result.fechaEntrega?.slice(0, 10) ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rubro</p>
            <p className="font-medium">{result.rubro?.nombre ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Referencia</p>
            <p className="font-medium">{result.referencia ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vendedor</p>
            <p className="font-medium">{result.vendedor?.nombre ?? result.vendedor?.username ?? '-'}</p>
          </div>
          {result.nota && (
            <div className="col-span-3">
              <p className="text-muted-foreground">Nota</p>
              <p className="font-medium whitespace-pre-wrap">{result.nota}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Ordenes de Trabajo ({result.ordenesTrabajo?.length ?? 0})</CardTitle>
          <Button asChild size="sm">
            <Link to={`/ordenes-trabajo/nueva?ofId=${result.id}`}>
              <Plus />
              Nueva OT
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OT</TableHead>
                <TableHead>Maquina</TableHead>
                <TableHead>Cant.</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(result.ordenesTrabajo ?? []).map((ot) => (
                <TableRow key={ot.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link to={`/ordenes-trabajo/${ot.id}`}>{ot.numeroOt}</Link>
                  </TableCell>
                  <TableCell>{ot.maquinaNombre}</TableCell>
                  <TableCell>{ot.cantidad}</TableCell>
                  <TableCell>{ot.fecha?.slice(0, 10)}</TableCell>
                  <TableCell>{ot.estado?.nombre && <Badge variant="secondary">{ot.estado.nombre}</Badge>}</TableCell>
                </TableRow>
              ))}
              {(!result.ordenesTrabajo || result.ordenesTrabajo.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Sin OTs todavia
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
