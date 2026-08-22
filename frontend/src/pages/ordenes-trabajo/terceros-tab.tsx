import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Tercero {
  id: number
  tercero: string
  fechaInicio: string | null
  fechaEntrega: string | null
}

export function TercerosTab({ otId }: { otId: number }) {
  const [terceros, setTerceros] = useState<Tercero[]>([])
  const [nuevo, setNuevo] = useState({ tercero: '', fechaInicio: '', fechaEntrega: '' })

  const load = () => {
    apiClient.get(`/ordenes-trabajo/${otId}/terceros`).then((res) => setTerceros(res.data))
  }

  useEffect(load, [otId])

  const agregar = async () => {
    if (!nuevo.tercero) return
    await apiClient.post(`/ordenes-trabajo/${otId}/terceros`, {
      tercero: nuevo.tercero,
      fechaInicio: nuevo.fechaInicio || undefined,
      fechaEntrega: nuevo.fechaEntrega || undefined,
    })
    setNuevo({ tercero: '', fechaInicio: '', fechaEntrega: '' })
    load()
  }

  const eliminar = async (id: number) => {
    await apiClient.delete(`/ordenes-trabajo/${otId}/terceros/${id}`)
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Tercero</label>
          <Input value={nuevo.tercero} onChange={(e) => setNuevo((v) => ({ ...v, tercero: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Inicio</label>
          <Input
            type="date"
            value={nuevo.fechaInicio}
            onChange={(e) => setNuevo((v) => ({ ...v, fechaInicio: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Entrega</label>
          <Input
            type="date"
            value={nuevo.fechaEntrega}
            onChange={(e) => setNuevo((v) => ({ ...v, fechaEntrega: e.target.value }))}
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
            <TableHead>Tercero</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Entrega</TableHead>
            <TableHead className="text-right">Accion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {terceros.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.tercero}</TableCell>
              <TableCell>{t.fechaInicio?.slice(0, 10) ?? '-'}</TableCell>
              <TableCell>{t.fechaEntrega?.slice(0, 10) ?? '-'}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => eliminar(t.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {terceros.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Sin terceros
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
