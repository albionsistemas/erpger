import { useState, useEffect } from 'react'
import { useForm } from '@refinedev/core'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCatalogo } from '@/hooks/useCatalogo'

interface OperarioValues {
  nombre: string
  sectorId?: number
  activo?: boolean
  imagenUrl?: string
}

const VACIO: OperarioValues = { nombre: '', activo: true }

export function OperarioForm({ id }: { id?: number }) {
  const navigate = useNavigate()
  const isEdit = id !== undefined

  const { query, onFinish, formLoading } = useForm<OperarioValues>({
    resource: 'operarios',
    id,
    action: isEdit ? 'edit' : 'create',
    redirect: false,
  })

  const [values, setValues] = useState<OperarioValues>(VACIO)

  useEffect(() => {
    const record = query?.data?.data as any
    if (record) {
      setValues({
        nombre: record.nombre,
        sectorId: record.sectorId ?? record.sector?.id,
        activo: record.activo,
        imagenUrl: record.imagenUrl,
      })
    }
  }, [query?.data])

  const { items: sectores } = useCatalogo('sectores-produccion')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onFinish(values)
    navigate('/operarios')
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{isEdit ? `Editar ${values.nombre || 'operario'}` : 'Nuevo Operario'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              required
              value={values.nombre}
              onChange={(e) => setValues((v) => ({ ...v, nombre: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Sector</Label>
            <Select
              value={values.sectorId ? String(values.sectorId) : undefined}
              onValueChange={(val) => setValues((v) => ({ ...v, sectorId: Number(val) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {sectores.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="activo"
              type="checkbox"
              checked={values.activo ?? true}
              onChange={(e) => setValues((v) => ({ ...v, activo: e.target.checked }))}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="activo">Activo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/operarios')}>
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
