import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface TipoMaquina {
  id: number
  codigo: string | null
  nombre: string
}

export function TiposMaquinaPage() {
  const [items, setItems] = useState<TipoMaquina[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<TipoMaquina | null>(null)
  const [form, setForm] = useState({ codigo: '', nombre: '' })
  const [guardando, setGuardando] = useState(false)

  const load = () => {
    setLoading(true)
    apiClient
      .get('/tipos-maquina')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ codigo: '', nombre: '' })
    setDialogOpen(true)
  }

  const abrirEditar = (item: TipoMaquina) => {
    setEditando(item)
    setForm({ codigo: item.codigo ?? '', nombre: item.nombre })
    setDialogOpen(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const payload = { nombre: form.nombre, codigo: form.codigo || undefined }
      if (editando) {
        await apiClient.patch(`/tipos-maquina/${editando.id}`, payload)
      } else {
        await apiClient.post('/tipos-maquina', payload)
      }
      setDialogOpen(false)
      load()
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (item: TipoMaquina) => {
    if (!confirm(`Eliminar el tipo de maquina "${item.nombre}"?`)) return
    await apiClient.delete(`/tipos-maquina/${item.id}`)
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tipo de Maquinas</h1>
        <Button onClick={abrirNuevo}>
          <Plus />
          Nuevo Tipo
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo</TableHead>
              <TableHead>Nombre</TableHead>
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
                <TableCell>{item.codigo ?? '-'}</TableCell>
                <TableCell className="font-medium">{item.nombre}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => abrirEditar(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => eliminar(item)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar tipo de maquina' : 'Nuevo tipo de maquina'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                required
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="codigo">Codigo</Label>
              <Input
                id="codigo"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
