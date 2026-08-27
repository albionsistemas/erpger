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

interface MaquinaValues {
  planoId: string
  tipoMaquinaId?: number
  nombre: string
  detalle?: string
  descripcion?: string
  usos?: string
  anchoMm?: number
  largoMm?: number
  altoMm?: number
  capacidad?: number
  imagenUrl?: string
  pdfUrl?: string
}

const VACIO: MaquinaValues = { planoId: '', nombre: '' }

export function MaquinaForm({ id }: { id?: number }) {
  const navigate = useNavigate()
  const isEdit = id !== undefined

  const { query, onFinish, formLoading } = useForm<MaquinaValues>({
    resource: 'maquinas',
    id,
    action: isEdit ? 'edit' : 'create',
    redirect: false,
  })

  const [values, setValues] = useState<MaquinaValues>(VACIO)

  useEffect(() => {
    const record = query?.data?.data as any
    if (record) {
      setValues({
        planoId: record.planoId,
        tipoMaquinaId: record.tipoMaquinaId ?? record.tipoMaquina?.id,
        nombre: record.nombre,
        detalle: record.detalle,
        descripcion: record.descripcion,
        usos: record.usos,
        anchoMm: record.anchoMm,
        largoMm: record.largoMm,
        altoMm: record.altoMm,
        capacidad: record.capacidad,
        imagenUrl: record.imagenUrl,
        pdfUrl: record.pdfUrl,
      })
    }
  }, [query?.data])

  const { items: tiposMaquina } = useCatalogo('tipos-maquina')
  const puedeEditar = usePuedeEditar('ingenieria')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await onFinish(values)
    const newId = (result as any)?.data?.id ?? id
    navigate(newId ? `/maquinas/${newId}` : '/maquinas')
  }

  if (!puedeEditar) return <SinPermiso />

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEdit ? `Editar ${values.nombre || 'maquina'}` : 'Nueva Maquina'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="planoId">Plano</Label>
            <Input
              id="planoId"
              required
              value={values.planoId}
              onChange={(e) => setValues((v) => ({ ...v, planoId: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tipo de maquina</Label>
            <Select
              value={values.tipoMaquinaId ? String(values.tipoMaquinaId) : undefined}
              onValueChange={(val) => setValues((v) => ({ ...v, tipoMaquinaId: Number(val) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {tiposMaquina.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              required
              value={values.nombre}
              onChange={(e) => setValues((v) => ({ ...v, nombre: e.target.value }))}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="detalle">Detalle</Label>
            <Input
              id="detalle"
              value={values.detalle ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, detalle: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="anchoMm">Ancho (mm)</Label>
            <Input
              id="anchoMm"
              type="number"
              value={values.anchoMm ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, anchoMm: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="largoMm">Largo (mm)</Label>
            <Input
              id="largoMm"
              type="number"
              value={values.largoMm ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, largoMm: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="altoMm">Alto (mm)</Label>
            <Input
              id="altoMm"
              type="number"
              value={values.altoMm ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, altoMm: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="capacidad">Capacidad</Label>
            <Input
              id="capacidad"
              type="number"
              value={values.capacidad ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, capacidad: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="usos">Usos</Label>
            <Input
              id="usos"
              value={values.usos ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, usos: e.target.value }))}
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
            <Button type="button" variant="outline" onClick={() => navigate('/maquinas')}>
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
