import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePuedeEditar } from '@/auth/usePermiso'

interface Empresa {
  id: number
  nombre: string
}

interface Deposito {
  id: number
  nombre: string
  direccion: string | null
  activo: boolean
  empresas: { empresa: Empresa }[]
}

export function DepositosPage() {
  const puedeEditar = usePuedeEditar('almacen')
  const [items, setItems] = useState<Deposito[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Deposito | null>(null)
  const [form, setForm] = useState({ nombre: '', direccion: '', activo: true, empresaIds: [] as number[] })
  const [guardando, setGuardando] = useState(false)

  const load = () => {
    setLoading(true)
    apiClient
      .get('/depositos')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])
  useEffect(() => {
    apiClient.get('/empresas').then((res) => setEmpresas(res.data))
  }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ nombre: '', direccion: '', activo: true, empresaIds: [] })
    setDialogOpen(true)
  }

  const abrirEditar = (item: Deposito) => {
    setEditando(item)
    setForm({
      nombre: item.nombre,
      direccion: item.direccion ?? '',
      activo: item.activo,
      empresaIds: item.empresas.map((e) => e.empresa.id),
    })
    setDialogOpen(true)
  }

  const toggleEmpresa = (id: number) => {
    setForm((f) => ({
      ...f,
      empresaIds: f.empresaIds.includes(id) ? f.empresaIds.filter((e) => e !== id) : [...f.empresaIds, id],
    }))
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const payload = {
        nombre: form.nombre,
        direccion: form.direccion || undefined,
        activo: form.activo,
        empresaIds: form.empresaIds,
      }
      if (editando) {
        await apiClient.patch(`/depositos/${editando.id}`, payload)
      } else {
        await apiClient.post('/depositos', payload)
      }
      setDialogOpen(false)
      load()
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (item: Deposito) => {
    if (!confirm(`Eliminar el deposito "${item.nombre}"?`)) return
    await apiClient.delete(`/depositos/${item.id}`)
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Depositos</h1>
        {puedeEditar && (
          <Button onClick={abrirNuevo}>
            <Plus />
            Nuevo Deposito
          </Button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Direccion</TableHead>
              <TableHead>Empresas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{item.direccion ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.empresas.length > 0 ? item.empresas.map((e) => e.empresa.nombre).join(', ') : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={item.activo ? 'default' : 'secondary'}>{item.activo ? 'Activo' : 'Inactivo'}</Badge>
                </TableCell>
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
            <DialogTitle>{editando ? 'Editar deposito' : 'Nuevo deposito'}</DialogTitle>
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
              <Label htmlFor="direccion">Direccion</Label>
              <Input
                id="direccion"
                value={form.direccion}
                onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Empresas propias a las que pertenece</Label>
              <div className="flex flex-col gap-1.5 rounded-md border p-3">
                {empresas.length === 0 && <p className="text-sm text-muted-foreground">Sin empresas cargadas</p>}
                {empresas.map((emp) => (
                  <label key={emp.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.empresaIds.includes(emp.id)}
                      onChange={() => toggleEmpresa(emp.id)}
                    />
                    {emp.nombre}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Opcional: un deposito puede no pertenecer a ninguna empresa, o a varias.</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
              />
              Activo
            </label>
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
