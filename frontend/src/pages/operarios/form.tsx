import { useState, useEffect } from 'react'
import { useForm } from '@refinedev/core'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCatalogo } from '@/hooks/useCatalogo'
import { apiClient } from '@/lib/api-client'
import { usePuedeEditar } from '@/auth/usePermiso'
import { SinPermiso } from '@/components/SinPermiso'

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
  const [subiendoImagen, setSubiendoImagen] = useState(false)

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
  const puedeEditar = usePuedeEditar('ajustes')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onFinish(values)
    navigate('/operarios')
  }

  const subirImagen = async (file: File) => {
    if (!isEdit) return
    setSubiendoImagen(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post(`/operarios/${id}/imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setValues((v) => ({ ...v, imagenUrl: res.data.imagenUrl }))
    } finally {
      setSubiendoImagen(false)
    }
  }

  if (!puedeEditar) return <SinPermiso />

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
            <Label>Foto</Label>
            <div className="flex items-center gap-3">
              {values.imagenUrl ? (
                <img src={values.imagenUrl} alt={values.nombre} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-muted" />
              )}
              <div>
                <input
                  id="imagen"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && subirImagen(e.target.files[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!isEdit || subiendoImagen}
                  onClick={() => document.getElementById('imagen')?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {subiendoImagen ? 'Subiendo...' : 'Subir foto'}
                </Button>
                {!isEdit && <p className="text-xs text-muted-foreground">Guarda el operario primero para poder subir la foto.</p>}
              </div>
            </div>
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
