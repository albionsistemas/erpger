import { useState, useEffect } from 'react'
import { useForm } from '@refinedev/core'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCatalogo } from '@/hooks/useCatalogo'
import { usePuedeEditar } from '@/auth/usePermiso'
import { SinPermiso } from '@/components/SinPermiso'

interface OrdenTrabajoValues {
  ofId: number
  numeroOt: number
  maquinaNombre: string
  cantidad: number
  plano?: string
  fecha: string
  fechaEjecucion?: string
  referencia?: string
  observaciones?: string
  estadoId?: number
}

export function OrdenTrabajoForm({ id }: { id?: number }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ofIdFromQuery = searchParams.get('ofId')
  const isEdit = id !== undefined

  const { query, onFinish, formLoading } = useForm<OrdenTrabajoValues>({
    resource: 'ordenes-trabajo',
    id,
    action: isEdit ? 'edit' : 'create',
    redirect: false,
  })

  const [values, setValues] = useState<OrdenTrabajoValues>({
    ofId: ofIdFromQuery ? Number(ofIdFromQuery) : 0,
    numeroOt: 0,
    maquinaNombre: '',
    cantidad: 1,
    fecha: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    const record = query?.data?.data as any
    if (record) {
      setValues({
        ofId: record.ofId ?? record.ordenFabricacion?.id,
        numeroOt: record.numeroOt,
        maquinaNombre: record.maquinaNombre,
        cantidad: record.cantidad,
        plano: record.plano,
        fecha: record.fecha?.slice(0, 10),
        fechaEjecucion: record.fechaEjecucion?.slice(0, 10),
        referencia: record.referencia,
        observaciones: record.observaciones,
        estadoId: record.estadoId ?? record.estado?.id,
      })
    }
  }, [query?.data])

  const { items: estadosOt } = useCatalogo('estados-ot')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await onFinish(values)
    const newId = (result as any)?.data?.id ?? id
    navigate(newId ? `/ordenes-trabajo/${newId}` : '/ordenes-trabajo')
  }

  const puedeEditar = usePuedeEditar('planificacion')
  if (!puedeEditar) return <SinPermiso />

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEdit ? `Editar OT ${values.numeroOt || ''}` : 'Nueva Orden de Trabajo'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ofId">OF (id)</Label>
            <Input
              id="ofId"
              type="number"
              required
              disabled={!!ofIdFromQuery}
              value={values.ofId || ''}
              onChange={(e) => setValues((v) => ({ ...v, ofId: Number(e.target.value) }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="numeroOt">Numero de OT</Label>
            <Input
              id="numeroOt"
              type="number"
              required
              value={values.numeroOt || ''}
              onChange={(e) => setValues((v) => ({ ...v, numeroOt: Number(e.target.value) }))}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="maquinaNombre">Maquina</Label>
            <Input
              id="maquinaNombre"
              required
              value={values.maquinaNombre}
              onChange={(e) => setValues((v) => ({ ...v, maquinaNombre: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              min={1}
              value={values.cantidad}
              onChange={(e) => setValues((v) => ({ ...v, cantidad: Number(e.target.value) }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plano">Plano</Label>
            <Input
              id="plano"
              value={values.plano ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, plano: e.target.value }))}
            />
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
            <Label htmlFor="fechaEjecucion">Fecha de ejecucion</Label>
            <Input
              id="fechaEjecucion"
              type="date"
              value={values.fechaEjecucion ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, fechaEjecucion: e.target.value }))}
            />
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
                {estadosOt.map((e) => (
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
            <Label htmlFor="observaciones">Observaciones</Label>
            <textarea
              id="observaciones"
              className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              value={values.observaciones ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, observaciones: e.target.value }))}
            />
          </div>

          <div className="col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
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
