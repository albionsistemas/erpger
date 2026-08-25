import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, ImageOff, Upload } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Empresa {
  id: number
  nombre: string
  activa: boolean
  cuit: string | null
  direccion: string | null
  ciudad: string | null
  pais: string | null
  telefono: string | null
  email: string | null
  web: string | null
  logoUrl: string | null
  bancoNombre: string | null
  bancoCuenta: string | null
  bancoSucursal: string | null
  bancoCbu: string | null
  bancoAlias: string | null
}

type FormValues = Omit<Empresa, 'id' | 'logoUrl'>

const VACIO: FormValues = {
  nombre: '',
  activa: true,
  cuit: '',
  direccion: '',
  ciudad: '',
  pais: '',
  telefono: '',
  email: '',
  web: '',
  bancoNombre: '',
  bancoCuenta: '',
  bancoSucursal: '',
  bancoCbu: '',
  bancoAlias: '',
}

export function EmpresasPage() {
  const [items, setItems] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Empresa | null>(null)
  const [form, setForm] = useState<FormValues>(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    apiClient
      .get('/empresas')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const abrirNuevo = () => {
    setEditando(null)
    setForm(VACIO)
    setDialogOpen(true)
  }

  const abrirEditar = (item: Empresa) => {
    setEditando(item)
    setForm({
      nombre: item.nombre,
      activa: item.activa,
      cuit: item.cuit ?? '',
      direccion: item.direccion ?? '',
      ciudad: item.ciudad ?? '',
      pais: item.pais ?? '',
      telefono: item.telefono ?? '',
      email: item.email ?? '',
      web: item.web ?? '',
      bancoNombre: item.bancoNombre ?? '',
      bancoCuenta: item.bancoCuenta ?? '',
      bancoSucursal: item.bancoSucursal ?? '',
      bancoCbu: item.bancoCbu ?? '',
      bancoAlias: item.bancoAlias ?? '',
    })
    setDialogOpen(true)
  }

  const limpiarVacios = (f: FormValues) =>
    Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' ? undefined : v]))

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const payload = limpiarVacios(form)
      if (editando) {
        await apiClient.patch(`/empresas/${editando.id}`, payload)
        load()
      } else {
        // Se deja el dialogo abierto y se pasa a modo edicion para
        // poder subir el logo a continuacion sin tener que reabrirlo.
        const res = await apiClient.post('/empresas', payload)
        setEditando(res.data)
        load()
      }
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (item: Empresa) => {
    if (!confirm(`Eliminar la empresa "${item.nombre}"?`)) return
    await apiClient.delete(`/empresas/${item.id}`)
    load()
  }

  const subirLogo = async (file: File) => {
    if (!editando) return
    setSubiendoLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post(`/empresas/${editando.id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setEditando(res.data)
      load()
    } finally {
      setSubiendoLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Empresas</h1>
        <Button onClick={abrirNuevo}>
          <Plus />
          Nueva Empresa
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>CUIT</TableHead>
              <TableHead>Ciudad / Pais</TableHead>
              <TableHead>Activa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.logoUrl ? (
                    <img src={item.logoUrl} alt={item.nombre} className="h-10 w-auto max-w-[80px] object-contain" />
                  ) : (
                    <div className="flex h-10 w-16 items-center justify-center rounded border border-dashed text-muted-foreground">
                      <ImageOff className="h-4 w-4" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{item.cuit ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {[item.ciudad, item.pais].filter(Boolean).join(', ') || '-'}
                </TableCell>
                <TableCell>
                  <span className={item.activa ? 'text-green-600' : 'text-muted-foreground'}>
                    {item.activa ? 'Si' : 'No'}
                  </span>
                </TableCell>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? `Editar ${editando.nombre}` : 'Nueva empresa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardar} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center gap-4">
              {editando?.logoUrl ? (
                <img src={editando.logoUrl} alt={editando.nombre} className="h-16 w-auto max-w-[140px] object-contain" />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded border border-dashed text-muted-foreground">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && subirLogo(e.target.files[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!editando || subiendoLogo}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {subiendoLogo ? 'Subiendo...' : 'Subir logo'}
                </Button>
                {!editando && <p className="text-xs text-muted-foreground">Guarda la empresa primero para poder subir el logo.</p>}
              </div>
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="nombre">Nombre / Razon social</Label>
              <Input
                id="nombre"
                required
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cuit">CUIT</Label>
              <Input id="cuit" value={form.cuit ?? ''} onChange={(e) => setForm((f) => ({ ...f, cuit: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input
                type="checkbox"
                checked={form.activa}
                onChange={(e) => setForm((f) => ({ ...f, activa: e.target.checked }))}
              />
              Activa
            </label>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="direccion">Direccion</Label>
              <Input
                id="direccion"
                value={form.direccion ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input id="ciudad" value={form.ciudad ?? ''} onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pais">Pais</Label>
              <Input id="pais" value={form.pais ?? ''} onChange={(e) => setForm((f) => ({ ...f, pais: e.target.value }))} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                value={form.telefono ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="web">Sitio web</Label>
              <Input id="web" value={form.web ?? ''} onChange={(e) => setForm((f) => ({ ...f, web: e.target.value }))} />
            </div>

            <div className="col-span-2 border-t pt-3 text-sm font-medium text-muted-foreground">Datos bancarios</div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bancoNombre">Banco</Label>
              <Input
                id="bancoNombre"
                value={form.bancoNombre ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, bancoNombre: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bancoCuenta">Cuenta</Label>
              <Input
                id="bancoCuenta"
                value={form.bancoCuenta ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, bancoCuenta: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bancoSucursal">Sucursal</Label>
              <Input
                id="bancoSucursal"
                value={form.bancoSucursal ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, bancoSucursal: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bancoCbu">CBU</Label>
              <Input
                id="bancoCbu"
                value={form.bancoCbu ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, bancoCbu: e.target.value }))}
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="bancoAlias">Alias</Label>
              <Input
                id="bancoAlias"
                value={form.bancoAlias ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, bancoAlias: e.target.value }))}
              />
            </div>

            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cerrar
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
