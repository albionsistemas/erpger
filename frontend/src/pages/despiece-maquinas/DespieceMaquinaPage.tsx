import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ArrowLeft, ImageOff, Rows3, Layers } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { ArticuloSelect } from '@/components/ArticuloSelect'
import { TIPOS_CORTE, labelTipoCorte } from '@/lib/despiece-cod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Maquina {
  id: number
  planoId: string
  nombre: string
  imagenUrl: string | null
}

interface DespieceLinea {
  id: number
  item: number
  plano: string | null
  piezaCodigo: string | null
  denominacion: string | null
  articuloId: number | null
  articuloTexto: string | null
  anchoMm: number | null
  largoMm: number | null
  cantidad: number
  tipoCorte: string | null
  nota: string | null
  esChapa: boolean | null
  cantidadComprar: number | null
  metrosLargoTotal: number | null
  metrosCantidadTotal: number | null
  barrasCantidad: number | null
  observacionesCorte: string | null
  esRepuesto: boolean | null
  verificaStock: boolean | null
  articulo: { id: number; nombre: string; imagenUrl: string | null } | null
}

interface FormValues {
  item: number
  piezaCodigo: string
  denominacion: string
  articuloId?: number
  articuloTexto: string
  anchoMm: string
  largoMm: string
  cantidad: string
  tipoCorte: string
  nota: string
  esChapa: boolean
  esRepuesto: boolean
  verificaStock: boolean
  metrosLargoTotal: string
  observacionesCorte: string
}

const VACIO: FormValues = {
  item: 1,
  piezaCodigo: '',
  denominacion: '',
  articuloId: undefined,
  articuloTexto: '',
  anchoMm: '',
  largoMm: '',
  cantidad: '',
  tipoCorte: '',
  nota: '',
  esChapa: false,
  esRepuesto: false,
  verificaStock: false,
  metrosLargoTotal: '',
  observacionesCorte: '',
}

const SIN_FILTRO = 'todos'

export function DespieceMaquinaPage() {
  const { id } = useParams()
  const [maquina, setMaquina] = useState<Maquina | null>(null)
  const [lineas, setLineas] = useState<DespieceLinea[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>(SIN_FILTRO)
  const [agrupado, setAgrupado] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<DespieceLinea | null>(null)
  const [values, setValues] = useState<FormValues>(VACIO)
  const [guardando, setGuardando] = useState(false)

  const cargarLineas = (planoId: string) => {
    setLoading(true)
    return apiClient
      .get('/despiece-maquinas', { params: { plano: planoId } })
      .then((res) => setLineas(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!id) return
    apiClient.get(`/maquinas/${id}`).then((res) => {
      setMaquina(res.data)
      cargarLineas(res.data.planoId)
    })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const tiposUsados = useMemo(() => {
    const usados = new Set(lineas.map((l) => l.tipoCorte).filter(Boolean) as string[])
    return TIPOS_CORTE.filter((t) => usados.has(t.value)).concat(
      [...usados].filter((v) => !TIPOS_CORTE.some((t) => t.value === v)).map((v) => ({ value: v, label: v })),
    )
  }, [lineas])

  const filtradas = useMemo(
    () => (filtroTipo === SIN_FILTRO ? lineas : lineas.filter((l) => l.tipoCorte === filtroTipo)),
    [lineas, filtroTipo],
  )

  const grupos = useMemo(() => {
    const mapa = new Map<
      string,
      { clave: string; nombre: string; cantidad: number; esChapa: boolean; metrosLargoTotal: number | null; multiplicacion: number }
    >()
    for (const l of filtradas) {
      const clave = l.articuloId ? `a-${l.articuloId}` : `t-${l.articuloTexto ?? l.denominacion ?? l.id}`
      const nombre = l.articulo?.nombre ?? l.articuloTexto ?? l.denominacion ?? '(sin nombre)'
      const esChapa = !!l.esChapa
      const factor = esChapa ? (l.anchoMm ?? 0) * (l.largoMm ?? 0) : (l.largoMm ?? 0)
      const existente = mapa.get(clave)
      if (existente) {
        existente.cantidad += l.cantidad
        existente.multiplicacion += factor * l.cantidad
        existente.metrosLargoTotal ??= l.metrosLargoTotal
      } else {
        mapa.set(clave, {
          clave,
          nombre,
          cantidad: l.cantidad,
          esChapa,
          metrosLargoTotal: l.metrosLargoTotal,
          multiplicacion: factor * l.cantidad,
        })
      }
    }
    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [filtradas])

  const abrirNuevo = () => {
    setEditando(null)
    const maxItem = lineas.reduce((m, l) => Math.max(m, l.item), 0)
    const anterior = lineas.find((l) => l.item === maxItem)
    setValues({ ...VACIO, item: maxItem + 1, piezaCodigo: anterior?.piezaCodigo ?? '' })
    setDialogOpen(true)
  }

  const abrirEditar = (l: DespieceLinea) => {
    setEditando(l)
    setValues({
      item: l.item,
      piezaCodigo: l.piezaCodigo ?? '',
      denominacion: l.denominacion ?? '',
      articuloId: l.articuloId ?? undefined,
      articuloTexto: l.articuloTexto ?? '',
      anchoMm: l.anchoMm?.toString() ?? '',
      largoMm: l.largoMm?.toString() ?? '',
      cantidad: l.cantidad?.toString() ?? '',
      tipoCorte: l.tipoCorte ?? '',
      nota: l.nota ?? '',
      esChapa: !!l.esChapa,
      esRepuesto: !!l.esRepuesto,
      verificaStock: !!l.verificaStock,
      metrosLargoTotal: l.metrosLargoTotal?.toString() ?? '',
      observacionesCorte: l.observacionesCorte ?? '',
    })
    setDialogOpen(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!maquina) return
    setGuardando(true)
    try {
      const payload = {
        item: values.item,
        plano: maquina.planoId,
        piezaCodigo: values.piezaCodigo || undefined,
        denominacion: values.denominacion || undefined,
        articuloId: values.articuloId,
        articuloTexto: values.articuloTexto || undefined,
        anchoMm: values.anchoMm ? Number(values.anchoMm) : undefined,
        largoMm: values.largoMm ? Number(values.largoMm) : undefined,
        cantidad: Number(values.cantidad),
        tipoCorte: values.tipoCorte || undefined,
        nota: values.nota || undefined,
        esChapa: values.esChapa,
        esRepuesto: values.tipoCorte === 'c' ? values.esRepuesto : undefined,
        verificaStock: values.verificaStock,
        metrosLargoTotal: values.metrosLargoTotal ? Number(values.metrosLargoTotal) : undefined,
        observacionesCorte: values.observacionesCorte || undefined,
      }
      if (editando) {
        await apiClient.patch(`/despiece-maquinas/${editando.id}`, payload)
      } else {
        await apiClient.post('/despiece-maquinas', payload)
      }
      setDialogOpen(false)
      await cargarLineas(maquina.planoId)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (l: DespieceLinea) => {
    if (!maquina) return
    if (!confirm(`Eliminar la linea ${l.item} (${l.articulo?.nombre ?? l.articuloTexto ?? l.denominacion})?`)) return
    await apiClient.delete(`/despiece-maquinas/${l.id}`)
    await cargarLineas(maquina.planoId)
  }

  const eliminarTodos = async () => {
    if (!maquina) return
    if (!confirm(`Eliminar TODAS las lineas de despiece de "${maquina.nombre}"? Esta accion no se puede deshacer.`)) return
    await apiClient.delete(`/despiece-maquinas/plano/${maquina.planoId}`)
    await cargarLineas(maquina.planoId)
  }

  if (!maquina) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to={`/maquinas/${maquina.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        {maquina.imagenUrl ? (
          <img src={maquina.imagenUrl} alt={maquina.nombre} className="h-14 w-14 rounded object-cover border" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded border border-dashed text-muted-foreground">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{maquina.nombre}</h1>
          <p className="text-sm text-muted-foreground">Plano {maquina.planoId} — Despiece</p>
        </div>
        <Button onClick={abrirNuevo}>
          <Plus />
          Agregar linea
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todos los tipos de corte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_FILTRO}>Todos los tipos de corte</SelectItem>
              {tiposUsados.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant={agrupado ? 'default' : 'outline'} onClick={() => setAgrupado((a) => !a)}>
            {agrupado ? <Layers className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
            {agrupado ? 'Agrupado' : 'Detalle'}
          </Button>
        </div>
        <Button variant="outline" className="text-destructive" onClick={eliminarTodos}>
          <Trash2 className="h-4 w-4" />
          Borrar todas las lineas
        </Button>
      </div>

      <Card>
        {!agrupado ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Codigo</TableHead>
                <TableHead>PL</TableHead>
                <TableHead>Articulo</TableHead>
                <TableHead>Denominacion</TableHead>
                <TableHead>Ancho</TableHead>
                <TableHead>Largo</TableHead>
                <TableHead>Cant</TableHead>
                <TableHead>Corte</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground">
                    Sin lineas de despiece
                  </TableCell>
                </TableRow>
              )}
              {filtradas.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.item}</TableCell>
                  <TableCell>
                    {l.articuloId ? (
                      <span className="font-medium text-green-600">{l.articuloId}</span>
                    ) : (
                      <span className="font-medium text-red-600">sin codigo</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{l.piezaCodigo ?? '-'}</TableCell>
                  <TableCell className="max-w-64 truncate" title={l.articulo?.nombre ?? l.articuloTexto ?? ''}>
                    {l.articulo ? (
                      <Link to={`/articulos/${l.articulo.id}`} className="text-primary hover:underline">
                        {l.articulo.nombre}
                      </Link>
                    ) : (
                      l.articuloTexto || '-'
                    )}
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">{l.denominacion ?? '-'}</TableCell>
                  <TableCell>{l.anchoMm ?? '-'}</TableCell>
                  <TableCell>{l.largoMm ?? '-'}</TableCell>
                  <TableCell>{l.cantidad}</TableCell>
                  <TableCell>{l.tipoCorte ? labelTipoCorte(l.tipoCorte) : '-'}</TableCell>
                  <TableCell className="max-w-40 truncate text-muted-foreground">{l.nota ?? '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(l)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => eliminar(l)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Articulo</TableHead>
                <TableHead>Cantidad total</TableHead>
                <TableHead>Comercial</TableHead>
                <TableHead>A comprar</TableHead>
                <TableHead>% Aprovechamiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Sin lineas de despiece
                  </TableCell>
                </TableRow>
              )}
              {grupos.map((g) => {
                const tieneCalculo = g.metrosLargoTotal && g.metrosLargoTotal > 0
                const division = tieneCalculo ? Math.ceil(g.multiplicacion / g.metrosLargoTotal!) : null
                const totalComprar = tieneCalculo ? g.metrosLargoTotal! * division! : null
                const efectividad = tieneCalculo && totalComprar ? Math.round((g.multiplicacion * 100) / totalComprar) : null
                return (
                  <TableRow key={g.clave}>
                    <TableCell className="font-medium">{g.nombre}</TableCell>
                    <TableCell>{g.cantidad}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tieneCalculo ? `${g.metrosLargoTotal} ${g.esChapa ? 'mm²' : 'mm'}` : '-'}
                    </TableCell>
                    <TableCell>{division ?? '-'}</TableCell>
                    <TableCell>{efectividad !== null ? `${efectividad}%` : '-'}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? `Editar linea ${editando.item}` : 'Nueva linea de despiece'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardar} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item">Item</Label>
              <Input
                id="item"
                type="number"
                required
                value={values.item}
                onChange={(e) => setValues((v) => ({ ...v, item: Number(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="piezaCodigo">PL (codigo de pieza)</Label>
              <Input
                id="piezaCodigo"
                value={values.piezaCodigo}
                onChange={(e) => setValues((v) => ({ ...v, piezaCodigo: e.target.value }))}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Articulo (catalogo)</Label>
              <ArticuloSelect
                value={values.articuloId}
                onChange={(articuloId, articulo) =>
                  setValues((v) => ({
                    ...v,
                    articuloId,
                    metrosLargoTotal:
                      articulo?.largoComercial != null ? String(articulo.largoComercial) : v.metrosLargoTotal,
                  }))
                }
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="articuloTexto">Descripcion del material (texto libre)</Label>
              <textarea
                id="articuloTexto"
                className="min-h-16 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                value={values.articuloTexto}
                onChange={(e) => setValues((v) => ({ ...v, articuloTexto: e.target.value }))}
                placeholder="Se muestra si no se elige un articulo del catalogo, o para aclarar el material"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="denominacion">Denominacion</Label>
              <Input
                id="denominacion"
                value={values.denominacion}
                onChange={(e) => setValues((v) => ({ ...v, denominacion: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="anchoMm">Ancho (mm)</Label>
              <Input
                id="anchoMm"
                type="number"
                value={values.anchoMm}
                onChange={(e) => setValues((v) => ({ ...v, anchoMm: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="largoMm">Largo (mm)</Label>
              <Input
                id="largoMm"
                type="number"
                value={values.largoMm}
                onChange={(e) => setValues((v) => ({ ...v, largoMm: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                required
                value={values.cantidad}
                onChange={(e) => setValues((v) => ({ ...v, cantidad: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tipo de corte</Label>
              <Select value={values.tipoCorte} onValueChange={(val) => setValues((v) => ({ ...v, tipoCorte: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CORTE.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="metrosLargoTotal">{values.esChapa ? 'Area comercial (mm²)' : 'Largo comercial (mm)'}</Label>
              <Input
                id="metrosLargoTotal"
                type="number"
                value={values.metrosLargoTotal}
                onChange={(e) => setValues((v) => ({ ...v, metrosLargoTotal: e.target.value }))}
              />
            </div>
            <div className="flex items-end gap-4 pb-2">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={values.esChapa}
                  onChange={(e) => setValues((v) => ({ ...v, esChapa: e.target.checked }))}
                />
                Es chapa
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={values.verificaStock}
                  onChange={(e) => setValues((v) => ({ ...v, verificaStock: e.target.checked }))}
                />
                Verificar stock
              </label>
              {values.tipoCorte === 'c' && (
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={values.esRepuesto}
                    onChange={(e) => setValues((v) => ({ ...v, esRepuesto: e.target.checked }))}
                  />
                  Es repuesto
                </label>
              )}
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="observacionesCorte">Observaciones de corte / dimension de recorte</Label>
              <Input
                id="observacionesCorte"
                value={values.observacionesCorte}
                onChange={(e) => setValues((v) => ({ ...v, observacionesCorte: e.target.value }))}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="nota">Nota</Label>
              <textarea
                id="nota"
                className="min-h-16 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                value={values.nota}
                onChange={(e) => setValues((v) => ({ ...v, nota: e.target.value }))}
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
