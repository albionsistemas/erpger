import { useState } from 'react'
import { useShow } from '@refinedev/core'
import { useParams, Link } from 'react-router-dom'
import { Pencil, DollarSign, ImageOff, FileText } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { esNuevo } from '@/lib/nuevo'
import { NewBadge } from '@/components/NewBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Precio {
  id: number
  precioUsd: string
  fecha: string
  motivo: string | null
  creador: { username: string; nombre: string | null } | null
}

interface ArticuloDetalle {
  id: number
  nombre: string
  planoPrincipal: string | null
  denominacionComercial: string | null
  nc: string | null
  modoVenta: string | null
  descripcion: string | null
  imagenUrl: string | null
  pdfUrl: string | null
  creadoEn: string
  categoria: { nombre: string } | null
  subcategoria: { nombre: string } | null
  rubro: { nombre: string } | null
  precios: Precio[]
}

const MODO_VENTA_LABEL: Record<string, string> = {
  UNITARIO: 'Unitario (por pieza)',
  LINEAL_MM: 'Lineal (precio por mm de largo)',
  AREA_MM2: 'Area (precio por mm2, ancho x largo)',
}

export function ArticulosShow() {
  const { id } = useParams()
  const { result, query } = useShow<ArticuloDetalle>({ resource: 'articulos', id: Number(id) })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [precioUsd, setPrecioUsd] = useState('')
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardarPrecio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!result) return
    setGuardando(true)
    try {
      await apiClient.post(`/articulos/${result.id}/precios`, { precioUsd: Number(precioUsd), motivo: motivo || undefined })
      await query.refetch()
      setDialogOpen(false)
      setPrecioUsd('')
      setMotivo('')
    } finally {
      setGuardando(false)
    }
  }

  if (query.isLoading) return <p className="text-muted-foreground">Cargando...</p>
  if (!result) return <p className="text-muted-foreground">No encontrado</p>

  const precioActual = result.precios?.[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {result.nombre} <span className="text-base font-normal text-muted-foreground">Codigo {result.id}</span>
          {esNuevo(result.creadoEn) && <NewBadge />}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <DollarSign />
            Cargar costo
          </Button>
          <Button asChild variant="outline">
            <Link to={`/articulos/${result.id}/editar`}>
              <Pencil />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-3 gap-4 pt-6 text-sm">
          <div>
            <p className="text-muted-foreground">Categoria</p>
            <p className="font-medium">{result.categoria?.nombre ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Subcategoria</p>
            <p className="font-medium">{result.subcategoria?.nombre ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rubro (linea de producto)</p>
            <p className="font-medium">{result.rubro?.nombre ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Modo de venta</p>
            <p className="font-medium">{result.modoVenta ? MODO_VENTA_LABEL[result.modoVenta] : '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Costo vigente</p>
            <p className="font-medium">{precioActual ? `US$ ${Number(precioActual.precioUsd).toLocaleString('es-AR')}` : '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Plano</p>
            <p className="font-medium">{result.planoPrincipal ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">NC</p>
            <p className="font-medium">{result.nc ?? '-'}</p>
          </div>
          {result.denominacionComercial && (
            <div className="col-span-3">
              <p className="text-muted-foreground">Denominacion comercial</p>
              <p className="font-medium">{result.denominacionComercial}</p>
            </div>
          )}
          {result.descripcion && (
            <div className="col-span-3">
              <p className="text-muted-foreground">Descripcion</p>
              <p className="font-medium whitespace-pre-wrap">{result.descripcion}</p>
            </div>
          )}
          <div className="col-span-3">
            <p className="mb-1 text-muted-foreground">Imagen</p>
            {result.imagenUrl ? (
              <img src={result.imagenUrl} alt={result.nombre} className="max-w-xs rounded-md border" />
            ) : (
              <div className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground">
                <ImageOff className="h-6 w-6" />
                <span className="text-xs">Sin imagen</span>
              </div>
            )}
          </div>
          {result.pdfUrl && (
            <div className="col-span-3">
              <p className="mb-1 text-muted-foreground">PDF</p>
              <a href={result.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline">
                <FileText className="h-4 w-4" />
                Ver PDF
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Historial de costo (USD)</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Costo USD</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!result.precios || result.precios.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Sin historial de costo
                  </TableCell>
                </TableRow>
              )}
              {result.precios?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.fecha).toLocaleString('es-AR')}</TableCell>
                  <TableCell>US$ {Number(p.precioUsd).toLocaleString('es-AR')}</TableCell>
                  <TableCell className="text-muted-foreground">{p.creador?.nombre ?? p.creador?.username ?? '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{p.motivo ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargar costo — {result.nombre}</DialogTitle>
          </DialogHeader>
          <form onSubmit={guardarPrecio} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="precioUsd">Costo en USD</Label>
              <Input
                id="precioUsd"
                required
                type="number"
                step="0.0001"
                value={precioUsd}
                onChange={(e) => setPrecioUsd(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Input id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
            <p className="text-sm text-muted-foreground">
              Se agrega como una fila nueva de historial, no reemplaza el costo anterior.
            </p>
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
