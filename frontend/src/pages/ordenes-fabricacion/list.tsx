import { useState } from 'react'
import { useTable, useGo, useDelete, type CrudFilter } from '@refinedev/core'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'

interface OrdenFabricacionRow {
  id: number
  numeroOf: number
  fecha: string
  fechaEntrega: string | null
  referencia: string | null
  tipoOrden: { nombre: string }
  estado: { nombre: string }
  cliente: { razonSocial: string } | null
  _count: { ordenesTrabajo: number }
}

export function OrdenesFabricacionList() {
  const [buscar, setBuscar] = useState('')
  const go = useGo()
  const { mutate: deleteOf } = useDelete()

  const filters: CrudFilter[] = buscar ? [{ field: 'buscar', operator: 'eq', value: buscar }] : []

  const { result, currentPage, setCurrentPage, pageCount, tableQuery } = useTable<OrdenFabricacionRow>({
    resource: 'ordenes-fabricacion',
    filters: { permanent: filters },
    pagination: { pageSize: 20 },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ordenes de Fabricacion</h1>
        <Button asChild>
          <Link to="/ordenes-fabricacion/nueva">
            <Plus />
            Nueva OF
          </Link>
        </Button>
      </div>

      <Input
        placeholder="Buscar por referencia o nota..."
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OF</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>OTs</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!tableQuery.isLoading && result.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
            {result.data.map((of) => (
              <TableRow key={of.id}>
                <TableCell className="font-medium">{of.numeroOf}</TableCell>
                <TableCell>{of.tipoOrden?.nombre}</TableCell>
                <TableCell>{of.cliente?.razonSocial ?? '-'}</TableCell>
                <TableCell>{of.fecha?.slice(0, 10)}</TableCell>
                <TableCell>{of.fechaEntrega?.slice(0, 10) ?? '-'}</TableCell>
                <TableCell>{of._count?.ordenesTrabajo ?? 0}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{of.estado?.nombre}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => go({ to: `/ordenes-fabricacion/${of.id}` })}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => go({ to: `/ordenes-fabricacion/${of.id}/editar` })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Eliminar OF ${of.numeroOf}? Se eliminan tambien sus OTs.`)) {
                          deleteOf({ resource: 'ordenes-fabricacion', id: of.id })
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Pagina {currentPage} de {pageCount || 1}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pageCount}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
