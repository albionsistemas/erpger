import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, Upload, UserRound } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { esFechaDesconocida } from '@/lib/nuevo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePuedeEditar } from '@/auth/usePermiso'

interface Contacto {
  id: number
  nombre: string
  cargo: string | null
  telefono: string | null
  email: string | null
  avatarUrl: string | null
}

interface Cliente {
  id: number
  razonSocial: string
  cuit: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  provincia: string | null
  pais: string | null
  rubro: string | null
  creadoEn: string
  creador: { id: number; username: string; nombre: string | null } | null
  contactos: Contacto[]
}

const VACIO = { nombre: '', cargo: '', telefono: '', email: '' }

export function ClienteShow() {
  const puedeEditar = usePuedeEditar('ventas')
  const { id } = useParams()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Contacto | null>(null)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [subiendoAvatarId, setSubiendoAvatarId] = useState<number | null>(null)
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const load = () => {
    setLoading(true)
    apiClient
      .get(`/clientes/${id}`)
      .then((res) => setCliente(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const abrirNuevo = () => {
    setEditando(null)
    setForm(VACIO)
    setDialogOpen(true)
  }

  const abrirEditar = (c: Contacto) => {
    setEditando(c)
    setForm({ nombre: c.nombre, cargo: c.cargo ?? '', telefono: c.telefono ?? '', email: c.email ?? '' })
    setDialogOpen(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cliente) return
    setGuardando(true)
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? undefined : v]))
      if (editando) {
        await apiClient.patch(`/clientes/${cliente.id}/contactos/${editando.id}`, payload)
      } else {
        await apiClient.post(`/clientes/${cliente.id}/contactos`, payload)
      }
      setDialogOpen(false)
      load()
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (c: Contacto) => {
    if (!cliente) return
    if (!confirm(`Eliminar el contacto "${c.nombre}"?`)) return
    await apiClient.delete(`/clientes/${cliente.id}/contactos/${c.id}`)
    load()
  }

  const subirAvatar = async (contactoId: number, file: File) => {
    if (!cliente) return
    setSubiendoAvatarId(contactoId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await apiClient.post(`/clientes/${cliente.id}/contactos/${contactoId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      load()
    } finally {
      setSubiendoAvatarId(null)
    }
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>
  if (!cliente) return <p className="text-muted-foreground">No encontrado</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to="/ventas/clientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">{cliente.razonSocial}</h1>
      </div>

      <Card>
        <CardContent className="grid grid-cols-3 gap-4 pt-6 text-sm">
          <div>
            <p className="text-muted-foreground">CUIT</p>
            <p className="font-medium">{cliente.cuit ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rubro</p>
            <p className="font-medium">{cliente.rubro ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Provincia / Pais</p>
            <p className="font-medium">{[cliente.provincia, cliente.pais].filter(Boolean).join(', ') || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Direccion</p>
            <p className="font-medium">{cliente.direccion ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Telefono</p>
            <p className="font-medium">{cliente.telefono ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{cliente.email ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha de alta</p>
            <p className="font-medium">
              {esFechaDesconocida(cliente.creadoEn) ? 'Sin fecha registrada' : new Date(cliente.creadoEn).toLocaleDateString('es-AR')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Cargado por</p>
            <p className="font-medium">{cliente.creador?.nombre ?? cliente.creador?.username ?? '-'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Contactos</h2>
        {puedeEditar && (
          <Button size="sm" onClick={abrirNuevo}>
            <Plus className="h-4 w-4" />
            Agregar contacto
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cliente.contactos.length === 0 && <p className="text-sm text-muted-foreground">Sin contactos cargados</p>}
        {cliente.contactos.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-start gap-3 pt-6">
              <div className="flex flex-col items-center gap-1">
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={c.nombre} className="h-12 w-12 rounded-full object-cover border" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed text-muted-foreground">
                    <UserRound className="h-5 w-5" />
                  </div>
                )}
                <input
                  ref={(el) => {
                    fileInputRefs.current[c.id] = el
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && subirAvatar(c.id, e.target.files[0])}
                />
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                  disabled={subiendoAvatarId === c.id}
                  onClick={() => fileInputRefs.current[c.id]?.click()}
                >
                  <Upload className="mb-0.5 inline h-3 w-3" /> {subiendoAvatarId === c.id ? '...' : 'foto'}
                </button>
              </div>
              <div className="flex-1">
                <p className="font-medium">{c.nombre}</p>
                <p className="text-sm text-muted-foreground">{c.cargo ?? '-'}</p>
                <p className="text-sm text-muted-foreground">{c.telefono ?? '-'}</p>
                <p className="text-sm text-muted-foreground">{c.email ?? '-'}</p>
              </div>
              {puedeEditar && (
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" onClick={() => abrirEditar(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => eliminar(c)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar contacto' : 'Nuevo contacto'}</DialogTitle>
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
              <Label htmlFor="cargo">Cargo</Label>
              <Input id="cargo" value={form.cargo} onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))} />
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
