import { useEffect, useState } from 'react'
import { useTable, useGo, useDelete, type CrudFilter } from '@refinedev/core'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, ImageOff, FileText, Ruler, ArrowUp, ArrowDown, ArrowUpDown, FileSpreadsheet } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { esNuevo, esFechaDesconocida } from '@/lib/nuevo'
import { NewBadge } from '@/components/NewBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePuedeEditar } from '@/auth/usePermiso'

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
  const puedeEditar = usePuedeEditar('ingenieria')
  const [buscar, setBuscar] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>(SIN_FILTRO)
  const [tiposMaquina, setTiposMaquina] = useState<{ id: number; nombre: string }[]>([])
  const [exportando, setExportando] = useState(false)
  const go = useGo()
  const { mutate: deleteMaquina } = useDelete()

  useEffect(() => {
    apiClient.get('/tipos-maquina').then((res) => setTiposMaquina(res.data))
  }, [])

  const filters: CrudFilter[] = [
    ...(buscar ? [{ field: 'buscar', operator: 'eq' as const, value: buscar }] : []),
    ...(filtroTipo !== SIN_FILTRO ? [{ field: 'tipoMaquinaId', operator: 'eq' as const, value: filtroTipo }] : []),
  ]

  const { result, currentPage, setCurrentPage, pageCount, tableQuery, sorters, setSorters } = useTable<MaquinaRow>({
    resource: 'maquinas',
    filters: { permanent: filters },
    pagination: { pageSize: 50 },
    sorters: { initial: [{ field: 'creadoEn', order: 'desc' }] },
  })

  const toggleSort = (field: string) => {
    const actual = sorters.find((s) => s.field === field)
    setSorters([{ field, order: actual?.order === 'asc' ? 'desc' : 'asc' }])
  }

  const exportar = async () => {
    setExportando(true)
    try {
      const params: Record<string, unknown> = {}
      if (buscar) params.buscar = buscar
      if (filtroTipo !== SIN_FILTRO) params.tipoMaquinaId = filtroTipo
      if (sorters[0]) {
        params.sortField = sorters[0].field
        params.sortOrder = sorters[0].order
      }
      const res = await apiClient.get('/maquinas/export', { params, responseType: 'blob' })
      const url = URL.createObjectURL(
        new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      )
      const a = document.createElement('a')
      a.href = url
      a.download = 'maquinas.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportando(false)
    }
  }

  const SortableHead = ({ field, label, className }: { field: string; label: string; className?: string }) => {
    const actual = sorters.find((s) => s.field === field)
    return (
      <TableHead className={className}>
        <button
          type="button"
          className="inline-flex items-center gap-1 hover:text-foreground"
          onClick={() => toggleSort(field)}
        >
          {label}
          {actual?.order === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : actual?.order === 'desc' ? (
            <ArrowDown className="h-3.5 w-3.5" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
          )}
        </button>
      </TableHead>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Maquinas</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportar} disabled={exportando}>
            <FileSpreadsheet className="h-4 w-4" />
            {exportando ? 'Exportando...' : 'Exportar a Excel'}
          </Button>
          {puedeEditar && (
            <Button asChild>
              <Link to="/maquinas/nueva">
                <Plus />
                Nueva Maquina
              </Link>
            </Button>
          )}
        </div>
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
              <SortableHead field="planoId" label="Plano" />
              <SortableHead field="nombre" label="Nombre" />
              <SortableHead field="partesCount" label="Partes" />
              <SortableHead field="creadoEn" label="Fecha de alta" />
              <TableHead>Recursos</TableHead>
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
                <TableCell className="text-muted-foreground">
                  {esFechaDesconocida(m.creadoEn) ? 'Sin fecha' : new Date(m.creadoEn).toLocaleDateString('es-AR')}
                </TableCell>
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
                    {puedeEditar && (
                      <>
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
