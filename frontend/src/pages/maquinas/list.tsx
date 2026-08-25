import { useEffect, useState } from 'react'
import { useTable, useGo, useDelete, type CrudFilter } from '@refinedev/core'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, ImageOff, FileText, Ruler } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { esNuevo } from '@/lib/nuevo'
import { NewBadge } from '@/components/NewBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MaquinaRow {
  id: number
  planoId: string
  nombre: string
  imagenUrl: string | null
  pdfUrl: string | null
  dxfUrl: string | null
  partesCount: number
  creadoEn: string
}

const SIN_FILTRO = 'todos'

export function MaquinasList() {
  const [buscar, setBuscar] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>(SIN_FILTRO)
  const [tiposMaquina, setTiposMaquina] = useState<{ id: number; nombre: string }[]>([])
  const go = useGo()
  const { mutate: deleteMaquina } = useDelete()

  useEffect(() => {
    apiClient.get('/tipos-maquina').then((res) => setTiposMaquina(res.data))
  }, [])

  const filters: CrudFilter[] = [
    ...(buscar ? [{ field: 'buscar', operator: 'eq' as const, value: buscar }] : []),
    ...(filtroTipo !== SIN_FILTRO ? [{ field: 'tipoMaquinaId', operator: 'eq' as const, value: filtroTipo }] : []),
  ]

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

      <div className="flex gap-3">
        <Input
          placeholder="Buscar por nombre o plano..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SIN_FILTRO}>Todos los tipos</SelectItem>
            {tiposMaquina.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Partes</TableHead>
              <TableHead>Recursos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!tableQuery.isLoading && result.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
            {result.data.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  {m.imagenUrl ? (
                    <img src={m.imagenUrl} alt={m.nombre} className="h-10 w-10 rounded object-cover border" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded border border-dashed text-muted-foreground">
                      <ImageOff className="h-4 w-4" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{m.planoId}</TableCell>
                <TableCell>
                  <Link to={`/maquinas/${m.id}/despiece`} className="text-primary hover:underline">
                    {m.nombre}
                  </Link>
                  {esNuevo(m.creadoEn) && <NewBadge />}
                </TableCell>
                <TableCell className="text-muted-foreground">{m.partesCount || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {m.pdfUrl && (
                      <a href={m.pdfUrl} target="_blank" rel="noreferrer" title="Ver PDF">
                        <FileText className="h-5 w-5 text-red-600" />
                      </a>
                    )}
                    {m.dxfUrl && (
                      <a href={m.dxfUrl} target="_blank" rel="noreferrer" title="Descargar DXF">
                        <Ruler className="h-5 w-5 text-blue-600" />
                      </a>
                    )}
                  </div>
                </TableCell>
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
