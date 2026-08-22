import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCatalogo } from '@/hooks/useCatalogo'

interface Tarea {
  id: number
  nombreTarea: string
  fechaInicio: string | null
  fechaTerminacion: string | null
  sector: { nombre: string }
  operario: { nombre: string } | null
}

export function TareasTab({ otId }: { otId: number }) {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [nuevo, setNuevo] = useState({ nombreTarea: '', sectorId: '', fechaInicio: '' })
  const { items: sectores } = useCatalogo('sectores-produccion')

  const load = () => {
    apiClient.get(`/ordenes-trabajo/${otId}/tareas`).then((res) => setTareas(res.data))
  }

  useEffect(load, [otId])

  const agregar = async () => {
    if (!nuevo.nombreTarea || !nuevo.sectorId) return
    await apiClient.post(`/ordenes-trabajo/${otId}/tareas`, {
      nombreTarea: nuevo.nombreTarea,
      sectorId: Number(nuevo.sectorId),
      fechaInicio: nuevo.fechaInicio || undefined,
    })
    setNuevo({ nombreTarea: '', sectorId: '', fechaInicio: '' })
    load()
  }

  const eliminar = async (id: number) => {
    await apiClient.delete(`/ordenes-trabajo/${otId}/tareas/${id}`)
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Tarea</label>
          <Input value={nuevo.nombreTarea} onChange={(e) => setNuevo((v) => ({ ...v, nombreTarea: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Sector</label>
          <Select value={nuevo.sectorId} onValueChange={(val) => setNuevo((v) => ({ ...v, sectorId: val }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sector..." />
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
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Inicio</label>
          <Input
            type="date"
            value={nuevo.fechaInicio}
            onChange={(e) => setNuevo((v) => ({ ...v, fechaInicio: e.target.value }))}
          />
        </div>
        <Button onClick={agregar}>
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarea</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Operario</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Fin</TableHead>
            <TableHead className="text-right">Accion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tareas.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.nombreTarea}</TableCell>
              <TableCell>{t.sector?.nombre}</TableCell>
              <TableCell>{t.operario?.nombre ?? '-'}</TableCell>
              <TableCell>{t.fechaInicio?.slice(0, 10) ?? '-'}</TableCell>
              <TableCell>{t.fechaTerminacion?.slice(0, 10) ?? '-'}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => eliminar(t.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {tareas.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Sin tareas
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
