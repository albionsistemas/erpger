import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, ImageOff, Upload } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePuedeEditar } from '@/auth/usePermiso'

interface Rubro {
  id: number
  nombre: string
  imagenUrl: string | null
}

export function RubrosPage() {
  const puedeEditar = usePuedeEditar('ajustes')
  const [items, setItems] = useState<Rubro[]>([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Rubro | null>(null)
  const [form, setForm] = useState({ nombre: '' })
  const [guardando, setGuardando] = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    apiClient
      .get('/rubros', { params: buscar ? { buscar } : undefined })
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [buscar])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ nombre: '' })
    setDialogOpen(true)
  }

  const abrirEditar = (item: Rubro) => {
    setEditando(item)
    setForm({ nombre: item.nombre })
    setDialogOpen(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const payload = { nombre: form.nombre }
      if (editando) {
        await apiClient.patch(`/rubros/${editando.id}`, payload)
      } else {
        await apiClient.post('/rubros', payload)
      }
      setDialogOpen(false)
      load()
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (item: Rubro) => {
    if (!confirm(`Eliminar el rubro "${item.nombre}"?`)) return
    await apiClient.delete(`/rubros/${item.id}`)
    load()
  }

  const subirImagen = async (file: File) => {
    if (!editando) return
    setSubiendoImagen(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post(`/rubros/${editando.id}/imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setEditando(res.data)
      load()
    } finally {
      setSubiendoImagen(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Rubros</h1>
        {puedeEditar && (
          <Button onClick={abrirNuevo}>
            <Plus />
            Nuevo Rubro
          </Button>
        )}
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
              <TableHead>Imagen</TableHead>
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
                <TableCell>
                  {item.imagenUrl ? (
                    <img src={item.imagenUrl} alt={item.nombre} className="h-10 w-10 rounded object-cover border" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded border border-dashed text-muted-foreground">
                      <ImageOff className="h-4 w-4" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.nombre}</TableCell>
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
            <DialogTitle>{editando ? 'Editar rubro' : 'Nuevo rubro'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardar} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {editando?.imagenUrl ? (
                <img src={editando.imagenUrl} alt={editando.nombre} className="h-16 w-16 rounded object-cover border" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed text-muted-foreground">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && subirImagen(e.target.files[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!editando || subiendoImagen}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {subiendoImagen ? 'Subiendo...' : 'Subir imagen'}
                </Button>
                {!editando && <p className="text-xs text-muted-foreground">Guarda el rubro primero para poder subir la imagen.</p>}
              </div>
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
