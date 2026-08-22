import { useState } from 'react'
import { useTable, useGo, useDelete } from '@refinedev/core'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'

interface OperarioRow {
  id: number
  nombre: string
  activo: boolean
  imagenUrl: string | null
  sector: { nombre: string } | null
}

export function OperariosList() {
  const [buscar, setBuscar] = useState('')
  const go = useGo()
  const { mutate: deleteOperario } = useDelete()

  // El backend de operarios no tiene busqueda de texto libre todavia,
  // asi que filtramos en el cliente sobre la pagina actual.
  const { result, currentPage, setCurrentPage, pageCount, tableQuery } = useTable<OperarioRow>({
    resource: 'operarios',
    pagination: { pageSize: 50 },
  })

  const filas = result.data.filter((o) => o.nombre.toLowerCase().includes(buscar.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Operarios</h1>
        <Button asChild>
          <Link to="/operarios/nuevo">
            <Plus />
            Nuevo Operario
          </Link>
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre..."
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!tableQuery.isLoading && filas.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
            {filas.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.nombre}</TableCell>
                <TableCell>{o.sector?.nombre ?? '-'}</TableCell>
                <TableCell>
                  <Badge variant={o.activo ? 'default' : 'secondary'}>{o.activo ? 'Activo' : 'Inactivo'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => go({ to: `/operarios/${o.id}/editar` })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Eliminar a ${o.nombre}?`)) {
                          deleteOperario({ resource: 'operarios', id: o.id })
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
