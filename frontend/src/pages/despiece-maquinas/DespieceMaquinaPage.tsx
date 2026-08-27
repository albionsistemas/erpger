import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, ArrowLeft, ImageOff, Printer } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { ArticuloSelect } from '@/components/ArticuloSelect'
import { TIPOS_CORTE } from '@/lib/despiece-cod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DetailTable, GroupTable } from './DespieceTables'
import { usePuedeEditar } from '@/auth/usePermiso'
import {
  type DespieceLinea,
  cortesDeMateriales,
  otrosMateriales,
  cortesParaMecanizado,
  compraComerciales,
  piezasComunes,
  bandasPiazMangueras,
  compraBuloneria,
  compraMaterial,
  pantografo,
  chapasDetalle,
  chapasTotal,
  rpfvDetalle,
  rpfvTotal,
  agrupar,
  factorLineal,
  factorArea,
} from './despiece-helpers'

interface Maquina {
  id: number
  planoId: string
  nombre: string
  imagenUrl: string | null
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

export function DespieceMaquinaPage() {
  const { id } = useParams()
  const [maquina, setMaquina] = useState<Maquina | null>(null)
  const [lineas, setLineas] = useState<DespieceLinea[]>([])
  const [loading, setLoading] = useState(true)

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

  const corte = useMemo(
    () => ({
      materiales: cortesDeMateriales(lineas),
      otros: otrosMateriales(lineas),
      mecanizado: cortesParaMecanizado(lineas),
    }),
    [lineas],
  )

  const compras = useMemo(
    () => ({
      comerciales: agrupar(compraComerciales(lineas), factorLineal),
      piezasComunes: agrupar(piezasComunes(lineas), factorLineal),
      bandas: bandasPiazMangueras(lineas),
      buloneria: agrupar(compraBuloneria(lineas), factorLineal),
      material: agrupar(compraMaterial(lineas), factorLineal),
    }),
    [lineas],
  )

  const chapas = useMemo(
    () => ({
      detalle: chapasDetalle(lineas),
      total: agrupar(chapasTotal(lineas), factorArea),
      rpfvDetalle: rpfvDetalle(lineas),
      rpfvTotal: agrupar(rpfvTotal(lineas), factorArea),
    }),
    [lineas],
  )

  const lineasPantografo = useMemo(() => pantografo(lineas), [lineas])

  type TipoPdf = 'general' | 'corte' | 'compras' | 'pantografo' | 'chapas'
  const [tab, setTab] = useState<TipoPdf>('general')
  const [imprimiendo, setImprimiendo] = useState<string | null>(null)
  const imprimir = async (tipo: TipoPdf) => {
    if (!maquina) return
    setImprimiendo(tipo)
    try {
      const res = await apiClient.get(`/despiece-maquinas/pdf/${tipo}/${encodeURIComponent(maquina.planoId)}`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      window.open(url, '_blank')
    } finally {
      setImprimiendo(null)
    }
  }
  const textoImprimir = tab === 'general' ? 'Imprimir (sin fotos)' : 'Imprimir'

  const puedeEditar = usePuedeEditar('ingenieria')
  const accionesFull = puedeEditar ? 'full' : 'ninguna'
  const accionesEditar = puedeEditar ? 'editar' : 'ninguna'

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
        {puedeEditar && (
          <Button onClick={abrirNuevo}>
            <Plus />
            Agregar linea
          </Button>
        )}
        <Button variant="destructive" disabled={imprimiendo === tab} onClick={() => imprimir(tab)}>
          <Printer className="h-4 w-4" />
          {imprimiendo === tab ? 'Generando...' : textoImprimir}
        </Button>
      </div>

      {loading && <p className="text-muted-foreground">Cargando...</p>}

      {!loading && (
        <Tabs value={tab} onValueChange={(v) => setTab(v as TipoPdf)}>
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="corte">Corte</TabsTrigger>
            <TabsTrigger value="compras">Compras</TabsTrigger>
            <TabsTrigger value="pantografo">Pantografo</TabsTrigger>
            <TabsTrigger value="chapas">Chapas</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <DetailTable
              lineas={lineas}
              columnas={['imagen', 'item', 'codigo', 'pl', 'articulo', 'ancho', 'largo', 'cant', 'corte']}
              acciones={accionesFull}
              onEditar={abrirEditar}
              onEliminar={eliminar}
              denominacionEnArticulo
            />
          </TabsContent>

          <TabsContent value="corte" className="flex flex-col gap-6">
            <DetailTable
              titulo="Cortes de materiales"
              subtitulo="Se filtra las cadenas 'delrin', 'delree', 'poliprolipeno', 'varilla', 'bronce', 'chapa' y 'nylon'"
              lineas={corte.materiales}
              columnas={['codigo', 'pl', 'articulo', 'largo', 'cant', 'corte']}
              acciones={accionesFull}
              onEditar={abrirEditar}
              onEliminar={eliminar}
            />
            <DetailTable
              titulo="Otros materiales"
              lineas={corte.otros}
              columnas={['codigo', 'pl', 'articulo', 'largo', 'cant', 'corte']}
              acciones={accionesFull}
              onEditar={abrirEditar}
              onEliminar={eliminar}
            />
            <DetailTable
              titulo="Cortes para mecanizado"
              subtitulo="Se filtra las cadenas 'delree', 'poliprolipeno', 'varilla', 'bronce', 'chapa' y 'nylon'"
              lineas={corte.mecanizado}
              columnas={['codigo', 'pl', 'articulo', 'largo', 'cant', 'corte']}
              acciones={accionesFull}
              onEditar={abrirEditar}
              onEliminar={eliminar}
            />
          </TabsContent>

          <TabsContent value="compras" className="flex flex-col gap-6">
            <GroupTable titulo="Compra en comerciales" subtitulo="Agrupado por articulo, sumando cantidades" grupos={compras.comerciales} />
            <GroupTable titulo="Piezas comunes" grupos={compras.piezasComunes} mostrarNota />
            <DetailTable
              titulo="Compras en bandas, PIAZ y mangueras"
              lineas={compras.bandas}
              columnas={['codigo', 'articulo', 'ancho', 'largo', 'cant']}
              acciones={accionesFull}
              onEditar={abrirEditar}
              onEliminar={eliminar}
            />
            <GroupTable titulo="Compra en buloneria" subtitulo="Agrupado por articulo, sumando cantidades" grupos={compras.buloneria} />
            <GroupTable
              titulo="Compra en material"
              subtitulo="Agrupado por articulo. Largo total necesario vs. largo comercial, redondeado hacia arriba"
              grupos={compras.material}
              mostrarCalculo
              unidad="mm"
            />
          </TabsContent>

          <TabsContent value="pantografo">
            <DetailTable
              lineas={lineasPantografo}
              columnas={['pl', 'denominacion', 'articulo', 'ancho', 'largo', 'cant', 'obs', 'codigo']}
              acciones={accionesEditar}
              onEditar={abrirEditar}
            />
          </TabsContent>

          <TabsContent value="chapas" className="flex flex-col gap-6">
            <DetailTable
              titulo="Chapas"
              lineas={chapas.detalle}
              columnas={['denominacion', 'ancho', 'largo', 'cant', 'corte']}
              acciones={accionesEditar}
              onEditar={abrirEditar}
            />
            <GroupTable
              titulo="Total en chapas"
              subtitulo="Area total necesaria vs. area comercial, redondeado hacia arriba"
              grupos={chapas.total}
              mostrarCalculo
              unidad="mm²"
            />
            <DetailTable
              titulo="Detalle: RPFV - Planchas"
              lineas={chapas.rpfvDetalle}
              columnas={['denominacion', 'ancho', 'largo', 'cant', 'corte']}
              acciones={accionesEditar}
              onEditar={abrirEditar}
            />
            <GroupTable
              titulo="Total en RPFV - Planchas"
              subtitulo="Area total necesaria vs. area comercial, redondeado hacia arriba"
              grupos={chapas.rpfvTotal}
              mostrarCalculo
              unidad="mm²"
            />
          </TabsContent>
        </Tabs>
      )}

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
