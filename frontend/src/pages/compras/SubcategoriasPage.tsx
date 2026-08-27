import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePuedeEditar } from '@/auth/usePermiso'

interface Categoria {
  id: number
  nombre: string
}

interface Subcategoria {
  id: number
  nombre: string
  categoriaId: number
  categoria: Categoria
}

const SIN_FILTRO = 'todas'

export function SubcategoriasPage() {
  const puedeEditar = usePuedeEditar('compras')
  const [items, setItems] = useState<Subcategoria[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>(SIN_FILTRO)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Subcategoria | null>(null)
  const [form, setForm] = useState({ nombre: '', categoriaId: '' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    apiClient.get('/categorias').then((res) => setCategorias(res.data))
  }, [])

  const load = () => {
    setLoading(true)
    apiClient
      .get('/subcategorias', {
        params: {
          ...(buscar ? { buscar } : {}),
          ...(filtroCategoria !== SIN_FILTRO ? { categoriaId: filtroCategoria } : {}),
        },
      })
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [buscar, filtroCategoria])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ nombre: '', categoriaId: filtroCategoria !== SIN_FILTRO ? filtroCategoria : '' })
    setDialogOpen(true)
  }

  const abrirEditar = (item: Subcategoria) => {
    setEditando(item)
    setForm({ nombre: item.nombre, categoriaId: String(item.categoriaId) })
    setDialogOpen(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const payload = { nombre: form.nombre, categoriaId: Number(form.categoriaId) }
      if (editando) {
        await apiClient.patch(`/subcategorias/${editando.id}`, payload)
      } else {
        await apiClient.post('/subcategorias', payload)
      }
      setDialogOpen(false)
      load()
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (item: Subcategoria) => {
    if (!confirm(`Eliminar la subcategoria "${item.nombre}"?`)) return
    await apiClient.delete(`/subcategorias/${item.id}`)
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Subcategorias de Articulos</h1>
        {puedeEditar && (
          <Button onClick={abrirNuevo}>
            <Plus />
            Nueva Subcategoria
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Buscar por nombre..."
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
              <TableHead>Nombre</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{item.categoria?.nombre}</TableCell>
                <TableCell className="text-right">
                  {puedeEditar && (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => eliminar(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar subcategoria' : 'Nueva subcategoria'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={form.categoriaId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoriaId: v }))}
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Elegir categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                required
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando || !form.categoriaId}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
