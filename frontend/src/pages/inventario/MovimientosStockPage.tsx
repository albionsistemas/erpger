import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useCatalogo } from '@/hooks/useCatalogo'
import { ArticuloSelect } from '@/components/ArticuloSelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePuedeEditar } from '@/auth/usePermiso'

type Tipo = 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA'

const TIPO_LABEL: Record<Tipo, string> = { ENTRADA: 'Entrada', SALIDA: 'Salida', TRANSFERENCIA: 'Transferencia' }
const TIPO_VARIANT: Record<Tipo, 'default' | 'destructive' | 'secondary'> = {
  ENTRADA: 'default',
  SALIDA: 'destructive',
  TRANSFERENCIA: 'secondary',
}
const UNIDAD_LABEL: Record<string, string> = { UNITARIO: 'unidades', LINEAL_MM: 'mm', AREA_MM2: 'mm²' }

interface Deposito {
  id: number
  nombre: string
}

interface Movimiento {
  id: number
  fecha: string
  tipo: Tipo
  cantidad: string
  referencia: string | null
  deposito: Deposito
  depositoDestino: Deposito | null
  articulo: { id: number; nombre: string; modoVenta: string | null }
  motivo: { id: number; nombre: string } | null
  usuario: { username: string; nombre: string | null } | null
}

const VACIO = {
  tipo: 'ENTRADA' as Tipo,
  depositoId: '',
  depositoDestinoId: '',
  articuloId: undefined as number | undefined,
  articuloModoVenta: undefined as string | undefined,
  cantidad: '',
  motivoId: '',
  referencia: '',
  nota: '',
}

export function MovimientosStockPage() {
  const puedeEditar = usePuedeEditar('almacen')
  const [items, setItems] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const motivosCatalogo = useCatalogo('motivos-movimiento')
  const motivos = motivosCatalogo.items as unknown as { id: number; nombre: string; aplicaA: string }[]
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    apiClient
      .get('/movimientos-stock')
      .then((res) => setItems(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])
  useEffect(() => {
    apiClient.get('/depositos').then((res) => setDepositos(res.data))
  }, [])

  const motivosDisponibles = motivos.filter((m) => m.aplicaA === form.tipo || m.aplicaA === 'AMBOS')

  const abrirNuevo = () => {
    setForm(VACIO)
    setError(null)
    setDialogOpen(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.articuloId) return
    setError(null)
    setGuardando(true)
    try {
      await apiClient.post('/movimientos-stock', {
        tipo: form.tipo,
        depositoId: Number(form.depositoId),
        depositoDestinoId: form.tipo === 'TRANSFERENCIA' ? Number(form.depositoDestinoId) : undefined,
        articuloId: form.articuloId,
        cantidad: Number(form.cantidad),
        motivoId: form.motivoId ? Number(form.motivoId) : undefined,
        referencia: form.referencia || undefined,
        nota: form.nota || undefined,
      })
      setDialogOpen(false)
      load()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(message) ? message.join('; ') : message ?? 'No se pudo registrar el movimiento')
    } finally {
      setGuardando(false)
    }
  }

  const unidad = form.articuloModoVenta ? (UNIDAD_LABEL[form.articuloModoVenta] ?? 'unidades') : 'unidades'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Movimientos de Stock</h1>
        {puedeEditar && (
          <Button onClick={abrirNuevo}>
            <Plus />
            Nuevo Movimiento
          </Button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Deposito</TableHead>
              <TableHead>Articulo</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Referencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Sin movimientos
                </TableCell>
              </TableRow>
            )}
            {items.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="text-muted-foreground">{new Date(m.fecha).toLocaleString('es-AR')}</TableCell>
                <TableCell>
                  <Badge variant={TIPO_VARIANT[m.tipo]}>{TIPO_LABEL[m.tipo]}</Badge>
                </TableCell>
                <TableCell>
                  {m.deposito.nombre}
                  {m.depositoDestino && <span className="text-muted-foreground"> → {m.depositoDestino.nombre}</span>}
                </TableCell>
                <TableCell>{m.articulo.nombre}</TableCell>
                <TableCell>
                  {m.cantidad} {UNIDAD_LABEL[m.articulo.modoVenta ?? ''] ?? ''}
                </TableCell>
                <TableCell className="text-muted-foreground">{m.motivo?.nombre ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{m.usuario?.nombre ?? m.usuario?.username ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{m.referencia ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo movimiento de stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as Tipo, motivoId: '' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SALIDA">Salida</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia entre depositos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{form.tipo === 'TRANSFERENCIA' ? 'Deposito origen' : 'Deposito'}</Label>
              <Select value={form.depositoId} onValueChange={(v) => setForm((f) => ({ ...f, depositoId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir deposito..." />
                </SelectTrigger>
                <SelectContent>
                  {depositos.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.tipo === 'TRANSFERENCIA' && (
              <div className="flex flex-col gap-1.5">
                <Label>Deposito destino</Label>
                <Select
                  value={form.depositoDestinoId}
                  onValueChange={(v) => setForm((f) => ({ ...f, depositoDestinoId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegir deposito..." />
                  </SelectTrigger>
                  <SelectContent>
                    {depositos
                      .filter((d) => String(d.id) !== form.depositoId)
                      .map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label>Articulo</Label>
              <ArticuloSelect
                value={form.articuloId}
                onChange={(id, articulo) =>
                  setForm((f) => ({ ...f, articuloId: id, articuloModoVenta: articulo?.modoVenta ?? undefined }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cantidad">Cantidad ({unidad})</Label>
              <Input
                id="cantidad"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.cantidad}
                onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Motivo</Label>
              <Select value={form.motivoId} onValueChange={(v) => setForm((f) => ({ ...f, motivoId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir motivo..." />
                </SelectTrigger>
                <SelectContent>
                  {motivosDisponibles.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="referencia">Referencia</Label>
              <Input
                id="referencia"
                placeholder="Ej: OT 5003, factura de compra..."
                value={form.referencia}
                onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nota">Nota</Label>
              <textarea
                id="nota"
                className="min-h-16 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                value={form.nota}
                onChange={(e) => setForm((f) => ({ ...f, nota: e.target.value }))}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  guardando ||
                  !form.depositoId ||
                  !form.articuloId ||
                  !form.cantidad ||
                  (form.tipo === 'TRANSFERENCIA' && !form.depositoDestinoId)
                }
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
