import { useState } from 'react'
import { useTable, useGo, useDelete, type CrudFilter } from '@refinedev/core'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'

interface MaquinaRow {
  id: number
  planoId: string
  nombre: string
  detalle: string | null
  tipoMaquina: { nombre: string } | null
}

export function MaquinasList() {
  const [buscar, setBuscar] = useState('')
  const go = useGo()
  const { mutate: deleteMaquina } = useDelete()

  const filters: CrudFilter[] = buscar ? [{ field: 'buscar', operator: 'eq', value: buscar }] : []

  const { result, currentPage, setCurrentPage, pageCount, tableQuery } = useTable<MaquinaRow>({
    resource: 'maquinas',
    filters: { permanent: filters },
    pagination: { pageSize: 20 },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Maquinas</h1>
        <Button asChild>
          <Link to="/maquinas/nueva">
            <Plus />
            Nueva Maquina
          </Link>
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre o plano..."
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plano</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!tableQuery.isLoading && result.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
            {result.data.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.planoId}</TableCell>
                <TableCell>{m.nombre}</TableCell>
                <TableCell>{m.detalle ?? '-'}</TableCell>
                <TableCell>{m.tipoMaquina?.nombre ?? '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => go({ to: `/maquinas/${m.id}` })}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => go({ to: `/maquinas/${m.id}/editar` })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Eliminar la maquina ${m.nombre}?`)) {
                          deleteMaquina({ resource: 'maquinas', id: m.id })
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
