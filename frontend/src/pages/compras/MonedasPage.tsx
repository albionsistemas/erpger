import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, TrendingUp, History } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Cotizacion {
  id: number
  tasaCambio: string
  fecha: string
  fuente: string
}

interface Moneda {
  id: number
  codigoIso: string
  nombre: string
  simbolo: string | null
  activa: boolean
  cotizaciones: Cotizacion[]
}

export function MonedasPage() {
  const [items, setItems] = useState<Moneda[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Moneda | null>(null)
  const [form, setForm] = useState({ codigoIso: '', nombre: '', simbolo: '' })
  const [guardando, setGuardando] = useState(false)

  const [cotDialogOpen, setCotDialogOpen] = useState(false)
  const [monedaCotizando, setMonedaCotizando] = useState<Moneda | null>(null)
  const [nuevaTasa, setNuevaTasa] = useState('')

  const [historialOpen, setHistorialOpen] = useState(false)
  const [historial, setHistorial] = useState<Cotizacion[]>([])
  const [historialMoneda, setHistorialMoneda] = useState<Moneda | null>(null)

  const load = () => {
    setLoading(true)
    apiClient
      .get('/monedas')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ codigoIso: '', nombre: '', simbolo: '' })
    setDialogOpen(true)
  }

  const abrirEditar = (item: Moneda) => {
    setEditando(item)
    setForm({ codigoIso: item.codigoIso, nombre: item.nombre, simbolo: item.simbolo ?? '' })
    setDialogOpen(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const payload = { codigoIso: form.codigoIso.toUpperCase(), nombre: form.nombre, simbolo: form.simbolo || undefined }
      if (editando) {
        await apiClient.patch(`/monedas/${editando.id}`, payload)
      } else {
        await apiClient.post('/monedas', payload)
      }
      setDialogOpen(false)
      load()
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (item: Moneda) => {
    if (!confirm(`Eliminar la moneda "${item.nombre}"?`)) return
    await apiClient.delete(`/monedas/${item.id}`)
    load()
  }

  const abrirCotizar = (item: Moneda) => {
    setMonedaCotizando(item)
    setNuevaTasa('')
    setCotDialogOpen(true)
  }

  const guardarCotizacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monedaCotizando) return
    setGuardando(true)
    try {
      await apiClient.post('/cotizaciones', {
        monedaId: monedaCotizando.id,
        tasaCambio: Number(nuevaTasa),
        fuente: 'MANUAL',
      })
      setCotDialogOpen(false)
      load()
    } finally {
      setGuardando(false)
    }
  }

  const verHistorial = async (item: Moneda) => {
    setHistorialMoneda(item)
    setHistorialOpen(true)
    const res = await apiClient.get('/cotizaciones', { params: { monedaId: item.id } })
    setHistorial(res.data)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Monedas y Cotizaciones</h1>
        <Button onClick={abrirNuevo}>
          <Plus />
          Nueva Moneda
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Cotizacion vigente (por USD)</TableHead>
              <TableHead>Fecha</TableHead>
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
            {items.map((item) => {
              const actual = item.cotizaciones[0]
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.codigoIso} {item.simbolo ? `(${item.simbolo})` : ''}
                  </TableCell>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{actual ? Number(actual.tasaCambio).toLocaleString('es-AR', { maximumFractionDigits: 4 }) : '-'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {actual ? new Date(actual.fecha).toLocaleString('es-AR') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Cargar cotizacion" onClick={() => abrirCotizar(item)}>
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Ver historial" onClick={() => verHistorial(item)}>
                        <History className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => eliminar(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar moneda' : 'Nueva moneda'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="codigoIso">Codigo ISO (USD, ARS, EUR...)</Label>
              <Input
                id="codigoIso"
                required
                maxLength={3}
                value={form.codigoIso}
                onChange={(e) => setForm((f) => ({ ...f, codigoIso: e.target.value }))}
              />
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="simbolo">Simbolo</Label>
              <Input
                id="simbolo"
                value={form.simbolo}
                onChange={(e) => setForm((f) => ({ ...f, simbolo: e.target.value }))}
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

      <Dialog open={cotDialogOpen} onOpenChange={setCotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargar cotizacion — {monedaCotizando?.nombre}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardarCotizacion} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tasa">Valor de 1 USD en {monedaCotizando?.codigoIso}</Label>
              <Input
                id="tasa"
                required
                type="number"
                step="0.0001"
                value={nuevaTasa}
                onChange={(e) => setNuevaTasa(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Se agrega como una fila nueva de historial, no reemplaza la cotizacion anterior.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCotDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={historialOpen} onOpenChange={setHistorialOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historial — {historialMoneda?.nombre}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Fuente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historial.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Sin historial
                  </TableCell>
                </TableRow>
              )}
              {historial.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{new Date(c.fecha).toLocaleString('es-AR')}</TableCell>
                  <TableCell>{Number(c.tasaCambio).toLocaleString('es-AR', { maximumFractionDigits: 4 })}</TableCell>
                  <TableCell className="text-muted-foreground">{c.fuente}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  )
}
