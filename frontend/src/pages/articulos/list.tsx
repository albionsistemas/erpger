import { useEffect, useState } from 'react'
import { useTable, useGo, useDelete, type CrudFilter } from '@refinedev/core'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, FileText } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { esNuevo } from '@/lib/nuevo'
import { NewBadge } from '@/components/NewBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Categoria {
  id: number
  nombre: string
}

interface ArticuloRow {
  id: number
  nombre: string
  pdfUrl: string | null
  precios: { precioUsd: string }[]
  creadoEn: string
}

const SIN_FILTRO = 'todas'

export function ArticulosList() {
  const [buscar, setBuscar] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>(SIN_FILTRO)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const go = useGo()
  const { mutate: deleteArticulo } = useDelete()

  useEffect(() => {
    apiClient.get('/categorias').then((res) => setCategorias(res.data))
  }, [])

  const filters: CrudFilter[] = [
    ...(buscar ? [{ field: 'buscar', operator: 'eq' as const, value: buscar }] : []),
    ...(filtroCategoria !== SIN_FILTRO ? [{ field: 'categoriaId', operator: 'eq' as const, value: filtroCategoria }] : []),
  ]

  const { result, currentPage, setCurrentPage, pageCount, tableQuery } = useTable<ArticuloRow>({
    resource: 'articulos',
    filters: { permanent: filters },
    pagination: { pageSize: 20 },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Articulos</h1>
        <Button asChild>
          <Link to="/articulos/nuevo">
            <Plus />
            Nuevo Articulo
          </Link>
        </Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Buscar por nombre o codigo..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Todas las categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SIN_FILTRO}>Todas las categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Recursos</TableHead>
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
            {result.data.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="text-muted-foreground">{a.id}</TableCell>
                <TableCell className="font-medium">
                  {a.nombre}
                  {esNuevo(a.creadoEn) && <NewBadge />}
                </TableCell>
                <TableCell>{a.precios?.[0] ? `US$ ${Number(a.precios[0].precioUsd).toLocaleString('es-AR')}` : '-'}</TableCell>
                <TableCell>
                  {a.pdfUrl && (
                    <a href={a.pdfUrl} target="_blank" rel="noreferrer" title="Ver PDF">
                      <FileText className="h-5 w-5 text-red-600" />
                    </a>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => go({ to: `/articulos/${a.id}` })}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => go({ to: `/articulos/${a.id}/editar` })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Eliminar el articulo "${a.nombre}"?`)) {
                          deleteArticulo({ resource: 'articulos', id: a.id })
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
