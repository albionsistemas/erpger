import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Etapa {
  otId: number
  sectorId: number
  completada: boolean
  porcentaje: number | null
  fechaCompletada: string | null
  sector: { id: number; nombre: string; orden: number }
}

export function EtapasTab({ otId }: { otId: number }) {
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    apiClient
      .get(`/ordenes-trabajo/${otId}/etapas`)
      .then((res) => setEtapas(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [otId])

  const toggle = async (sectorId: number, completada: boolean) => {
    await apiClient.patch(`/ordenes-trabajo/${otId}/etapas/${sectorId}`, {
      completada,
      fechaCompletada: completada ? new Date().toISOString().slice(0, 10) : undefined,
    })
    load()
  }

  if (loading) return <p className="text-sm text-muted-foreground">Cargando...</p>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sector</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Accion</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {etapas.map((etapa) => (
          <TableRow key={etapa.sectorId}>
            <TableCell>{etapa.sector.nombre}</TableCell>
            <TableCell>
              <Badge variant={etapa.completada ? 'default' : 'secondary'}>
                {etapa.completada
                  ? 'Completada'
                  : etapa.porcentaje
                    ? `En proceso (${etapa.porcentaje}%)`
                    : 'Pendiente'}
              </Badge>
            </TableCell>
            <TableCell>{etapa.fechaCompletada?.slice(0, 10) ?? '-'}</TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggle(etapa.sectorId, !etapa.completada)}
              >
                {etapa.completada ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {etapa.completada ? 'Marcar pendiente' : 'Marcar completada'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {etapas.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Sin etapas cargadas
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
