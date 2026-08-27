import { useState, useEffect } from 'react'
import { useForm } from '@refinedev/core'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCatalogo } from '@/hooks/useCatalogo'
import { usePuedeEditar } from '@/auth/usePermiso'
import { SinPermiso } from '@/components/SinPermiso'

interface ArticuloValues {
  nombre: string
  categoriaId?: number
  subcategoriaId?: number
  rubroId?: number
  planoPrincipal?: string
  denominacionComercial?: string
  nc?: string
  modoVenta?: 'UNITARIO' | 'LINEAL_MM' | 'AREA_MM2'
  descripcion?: string
  imagenUrl?: string
  pdfUrl?: string
  stockMinimo?: number
}

const VACIO: ArticuloValues = { nombre: '' }

const MODO_VENTA_LABEL: Record<string, string> = {
  UNITARIO: 'Unitario (por pieza)',
  LINEAL_MM: 'Lineal (precio por mm de largo)',
  AREA_MM2: 'Area (precio por mm2, ancho x largo)',
}

export function ArticuloForm({ id }: { id?: number }) {
  const navigate = useNavigate()
  const isEdit = id !== undefined

  const { query, onFinish, formLoading } = useForm<ArticuloValues>({
    resource: 'articulos',
    id,
    action: isEdit ? 'edit' : 'create',
    redirect: false,
  })

  const [values, setValues] = useState<ArticuloValues>(VACIO)
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([])
  const [subcategorias, setSubcategorias] = useState<{ id: number; nombre: string }[]>([])
  const { items: rubros } = useCatalogo('rubros')

  useEffect(() => {
    const record = query?.data?.data as any
    if (record) {
      setValues({
        nombre: record.nombre,
        categoriaId: record.categoriaId ?? record.categoria?.id,
        subcategoriaId: record.subcategoriaId ?? record.subcategoria?.id,
        rubroId: record.rubroId ?? record.rubro?.id,
        planoPrincipal: record.planoPrincipal,
        denominacionComercial: record.denominacionComercial,
        nc: record.nc,
        modoVenta: record.modoVenta,
        descripcion: record.descripcion,
        imagenUrl: record.imagenUrl,
        pdfUrl: record.pdfUrl,
        stockMinimo: record.stockMinimo !== null && record.stockMinimo !== undefined ? Number(record.stockMinimo) : undefined,
      })
    }
  }, [query?.data])

  useEffect(() => {
    apiClient.get('/categorias').then((res) => setCategorias(res.data))
  }, [])

  useEffect(() => {
    if (!values.categoriaId) {
      setSubcategorias([])
      return
    }
    apiClient.get('/subcategorias', { params: { categoriaId: values.categoriaId } }).then((res) => setSubcategorias(res.data))
  }, [values.categoriaId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await onFinish(values)
    const newId = (result as any)?.data?.id ?? id
    navigate(newId ? `/articulos/${newId}` : '/articulos')
  }

  const puedeEditar = usePuedeEditar('compras')
  if (!puedeEditar) return <SinPermiso />

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>
          {isEdit ? `Editar ${values.nombre || 'articulo'}` : 'Nuevo Articulo'}
          {isEdit && <span className="ml-2 text-sm font-normal text-muted-foreground">Codigo {id}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              required
              value={values.nombre}
              onChange={(e) => setValues((v) => ({ ...v, nombre: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Categoria</Label>
            <Select
              value={values.categoriaId ? String(values.categoriaId) : undefined}
              onValueChange={(val) => setValues((v) => ({ ...v, categoriaId: Number(val), subcategoriaId: undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Subcategoria</Label>
            <Select
              value={values.subcategoriaId ? String(values.subcategoriaId) : undefined}
              onValueChange={(val) => setValues((v) => ({ ...v, subcategoriaId: Number(val) }))}
              disabled={!values.categoriaId}
            >
              <SelectTrigger>
                <SelectValue placeholder={values.categoriaId ? 'Seleccionar...' : 'Elegi una categoria primero'} />
              </SelectTrigger>
              <SelectContent>
                {subcategorias.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Rubro (linea de producto)</Label>
            <Select
              value={values.rubroId ? String(values.rubroId) : undefined}
              onValueChange={(val) => setValues((v) => ({ ...v, rubroId: Number(val) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {rubros.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Modo de venta</Label>
            <Select
              value={values.modoVenta}
              onValueChange={(val) => setValues((v) => ({ ...v, modoVenta: val as ArticuloValues['modoVenta'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MODO_VENTA_LABEL).map(([k, label]) => (
                  <SelectItem key={k} value={k}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="planoPrincipal">Plano</Label>
            <Input
              id="planoPrincipal"
              value={values.planoPrincipal ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, planoPrincipal: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="denominacionComercial">Denominacion comercial</Label>
            <Input
              id="denominacionComercial"
              value={values.denominacionComercial ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, denominacionComercial: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nc">NC (codigo aduanero)</Label>
            <Input id="nc" value={values.nc ?? ''} onChange={(e) => setValues((v) => ({ ...v, nc: e.target.value }))} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stockMinimo">Stock minimo (Inventario)</Label>
            <Input
              id="stockMinimo"
              type="number"
              step="0.01"
              min="0"
              value={values.stockMinimo ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, stockMinimo: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="Sin minimo definido"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="imagenUrl">URL de imagen</Label>
            <Input
              id="imagenUrl"
              value={values.imagenUrl ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, imagenUrl: e.target.value }))}
              placeholder="/uploads/articulos/..."
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="pdfUrl">URL de PDF</Label>
            <Input
              id="pdfUrl"
              value={values.pdfUrl ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, pdfUrl: e.target.value }))}
              placeholder="/uploads/articulos-pdf/..."
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="descripcion">Descripcion</Label>
            <textarea
              id="descripcion"
              className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              value={values.descripcion ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, descripcion: e.target.value }))}
            />
          </div>

          <div className="col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/articulos')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
