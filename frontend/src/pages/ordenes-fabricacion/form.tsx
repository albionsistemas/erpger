import { useState, useEffect } from 'react'
import { useForm } from '@refinedev/core'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCatalogo } from '@/hooks/useCatalogo'
import { usePuedeEditar } from '@/auth/usePermiso'
import { SinPermiso } from '@/components/SinPermiso'

interface OrdenFabricacionValues {
  numeroOf: number
  tipoOrdenId: number
  clienteId?: number
  fecha: string
  fechaEntrega?: string
  rubroId?: number
  referencia?: string
  nota?: string
  vendedorId?: number
  estadoId: number
}

const VACIO: OrdenFabricacionValues = {
  numeroOf: 0,
  tipoOrdenId: 0,
  fecha: new Date().toISOString().slice(0, 10),
  estadoId: 0,
}

export function OrdenFabricacionForm({ id }: { id?: number }) {
  const navigate = useNavigate()
  const isEdit = id !== undefined

  const { query, onFinish, formLoading } = useForm<OrdenFabricacionValues>({
    resource: 'ordenes-fabricacion',
    id,
    action: isEdit ? 'edit' : 'create',
    redirect: false,
  })

  const [values, setValues] = useState<OrdenFabricacionValues>(VACIO)

  useEffect(() => {
    const record = query?.data?.data as (OrdenFabricacionValues & { id: number }) | undefined
    if (record) {
      setValues({
        numeroOf: record.numeroOf,
        tipoOrdenId: (record as any).tipoOrdenId ?? (record as any).tipoOrden?.id,
        clienteId: (record as any).clienteId ?? (record as any).cliente?.id,
        fecha: record.fecha?.slice(0, 10),
        fechaEntrega: record.fechaEntrega?.slice(0, 10),
        rubroId: (record as any).rubroId ?? (record as any).rubro?.id,
        referencia: record.referencia,
        nota: record.nota,
        vendedorId: (record as any).vendedorId ?? (record as any).vendedor?.id,
        estadoId: (record as any).estadoId ?? (record as any).estado?.id,
      })
    }
  }, [query?.data])

  const { items: tiposOrden } = useCatalogo('tipos-orden')
  const { items: estadosOf } = useCatalogo('estados-of')
  const { items: rubros } = useCatalogo('rubros')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await onFinish(values)
    const newId = (result as any)?.data?.id ?? id
    navigate(newId ? `/ordenes-fabricacion/${newId}` : '/ordenes-fabricacion')
  }

  const puedeEditar = usePuedeEditar('planificacion')
  if (!puedeEditar) return <SinPermiso />

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEdit ? `Editar OF ${values.numeroOf || ''}` : 'Nueva Orden de Fabricacion'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="numeroOf">Numero de OF</Label>
            <Input
              id="numeroOf"
              type="number"
              required
              value={values.numeroOf || ''}
              onChange={(e) => setValues((v) => ({ ...v, numeroOf: Number(e.target.value) }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <Select
              value={values.tipoOrdenId ? String(values.tipoOrdenId) : undefined}
              onValueChange={(val) => setValues((v) => ({ ...v, tipoOrdenId: Number(val) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {tiposOrden.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              required
              value={values.fecha ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, fecha: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fechaEntrega">Fecha de entrega</Label>
            <Input
              id="fechaEntrega"
              type="date"
              value={values.fechaEntrega ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, fechaEntrega: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clienteId">Cliente (codigo)</Label>
            <Input
              id="clienteId"
              type="number"
              value={values.clienteId ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, clienteId: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Rubro</Label>
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
            <Label>Estado</Label>
            <Select
              value={values.estadoId ? String(values.estadoId) : undefined}
              onValueChange={(val) => setValues((v) => ({ ...v, estadoId: Number(val) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {estadosOf.map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="referencia">Referencia</Label>
            <Input
              id="referencia"
              value={values.referencia ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, referencia: e.target.value }))}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="nota">Nota</Label>
            <textarea
              id="nota"
              className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              value={values.nota ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, nota: e.target.value }))}
            />
          </div>

          <div className="col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/ordenes-fabricacion')}>
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
