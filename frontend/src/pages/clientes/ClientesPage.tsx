import { useState } from 'react'
import { useTable, type CrudFilter } from '@refinedev/core'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ClienteRow {
  id: number
  razonSocial: string
  cuit: string | null
  provincia: string | null
  pais: string | null
  rubro: string | null
  _count: { contactos: number; ordenesFabricacion: number }
}

interface FormValues {
  razonSocial: string
  cuit: string
  direccion: string
  telefono: string
  email: string
  provincia: string
  pais: string
  rubro: string
}

const VACIO: FormValues = {
  razonSocial: '',
  cuit: '',
  direccion: '',
  telefono: '',
  email: '',
  provincia: '',
  pais: '',
  rubro: '',
}

export function ClientesPage() {
  const [buscar, setBuscar] = useState('')
  const filters: CrudFilter[] = buscar ? [{ field: 'buscar', operator: 'eq', value: buscar }] : []

  const { result, currentPage, setCurrentPage, pageCount, tableQuery } = useTable<ClienteRow>({
    resource: 'clientes',
    filters: { permanent: filters },
    pagination: { pageSize: 50 },
  })
  const refetch = tableQuery.refetch

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<number | null>(null)
  const [form, setForm] = useState<FormValues>(VACIO)
  const [guardando, setGuardando] = useState(false)

  const abrirNuevo = () => {
    setEditando(null)
    setForm(VACIO)
    setDialogOpen(true)
  }

  const abrirEditar = async (id: number) => {
    const { data } = await apiClient.get(`/clientes/${id}`)
    setEditando(id)
    setForm({
      razonSocial: data.razonSocial,
      cuit: data.cuit ?? '',
      direccion: data.direccion ?? '',
      telefono: data.telefono ?? '',
      email: data.email ?? '',
      provincia: data.provincia ?? '',
      pais: data.pais ?? '',
      rubro: data.rubro ?? '',
    })
    setDialogOpen(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? undefined : v]))
      if (editando) {
        await apiClient.patch(`/clientes/${editando}`, payload)
      } else {
        await apiClient.post('/clientes', payload)
      }
      setDialogOpen(false)
      refetch()
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (item: ClienteRow) => {
    if (!confirm(`Eliminar el cliente "${item.razonSocial}"?`)) return
    await apiClient.delete(`/clientes/${item.id}`)
    refetch()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <Button onClick={abrirNuevo}>
          <Plus />
          Nuevo Cliente
        </Button>
      </div>

      <Input
        placeholder="Buscar por razon social o CUIT..."
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razon social</TableHead>
              <TableHead>CUIT</TableHead>
              <TableHead>Provincia / Pais</TableHead>
              <TableHead>Rubro</TableHead>
              <TableHead>Contactos</TableHead>
              <TableHead>OF</TableHead>
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
            {result.data.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <Link to={`/ventas/clientes/${c.id}`} className="text-primary hover:underline">
                    {c.razonSocial}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.cuit ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {[c.provincia, c.pais].filter(Boolean).join(', ') || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">{c.rubro ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{c._count?.contactos || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{c._count?.ordenesFabricacion || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/ventas/clientes/${c.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => abrirEditar(c.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => eliminar(c)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardar} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="razonSocial">Razon social</Label>
              <Input
                id="razonSocial"
                required
                value={form.razonSocial}
                onChange={(e) => setForm((f) => ({ ...f, razonSocial: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cuit">CUIT</Label>
              <Input id="cuit" value={form.cuit} onChange={(e) => setForm((f) => ({ ...f, cuit: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rubro">Rubro</Label>
              <Input id="rubro" value={form.rubro} onChange={(e) => setForm((f) => ({ ...f, rubro: e.target.value }))} />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="direccion">Direccion</Label>
              <Input
                id="direccion"
                value={form.direccion}
                onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="provincia">Provincia</Label>
              <Input
                id="provincia"
                value={form.provincia}
                onChange={(e) => setForm((f) => ({ ...f, provincia: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pais">Pais</Label>
              <Input id="pais" value={form.pais} onChange={(e) => setForm((f) => ({ ...f, pais: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
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
