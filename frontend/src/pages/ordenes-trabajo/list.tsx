import { useState } from 'react'
import { useTable, useGo, useDelete, type CrudFilter } from '@refinedev/core'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { usePuedeEditar } from '@/auth/usePermiso'

interface OrdenTrabajoRow {
  id: number
  numeroOt: number
  maquinaNombre: string
  cantidad: number
  fecha: string
  estado: { nombre: string } | null
  ordenFabricacion: { numeroOf: number }
}

export function OrdenesTrabajoList() {
  const puedeEditar = usePuedeEditar('planificacion')
  const [buscar, setBuscar] = useState('')
  const [searchParams] = useSearchParams()
  const ofId = searchParams.get('ofId')
  const go = useGo()
  const { mutate: deleteOt } = useDelete()

  const filters: CrudFilter[] = [
    ...(buscar ? [{ field: 'buscar', operator: 'eq' as const, value: buscar }] : []),
    ...(ofId ? [{ field: 'ofId', operator: 'eq' as const, value: ofId }] : []),
  ]

  const { result, currentPage, setCurrentPage, pageCount, tableQuery } = useTable<OrdenTrabajoRow>({
    resource: 'ordenes-trabajo',
    filters: { permanent: filters },
    pagination: { pageSize: 20 },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ordenes de Trabajo</h1>
        {puedeEditar && (
          <Button asChild>
            <Link to={ofId ? `/ordenes-trabajo/nueva?ofId=${ofId}` : '/ordenes-trabajo/nueva'}>
              <Plus />
              Nueva OT
            </Link>
          </Button>
        )}
      </div>

      <Input
        placeholder="Buscar por maquina o referencia..."
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OT</TableHead>
              <TableHead>OF</TableHead>
              <TableHead>Maquina</TableHead>
              <TableHead>Cant.</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!tableQuery.isLoading && result.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
            {result.data.map((ot) => (
              <TableRow key={ot.id}>
                <TableCell className="font-medium">{ot.numeroOt}</TableCell>
                <TableCell>{ot.ordenFabricacion?.numeroOf}</TableCell>
                <TableCell>{ot.maquinaNombre}</TableCell>
                <TableCell>{ot.cantidad}</TableCell>
                <TableCell>{ot.fecha?.slice(0, 10)}</TableCell>
                <TableCell>{ot.estado?.nombre && <Badge variant="secondary">{ot.estado.nombre}</Badge>}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => go({ to: `/ordenes-trabajo/${ot.id}` })}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {puedeEditar && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => go({ to: `/ordenes-trabajo/${ot.id}/editar` })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Eliminar OT ${ot.numeroOt}?`)) {
                              deleteOt({ resource: 'ordenes-trabajo', id: ot.id })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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
