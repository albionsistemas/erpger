import { useShow } from '@refinedev/core'
import { useParams, Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EtapasTab } from './etapas-tab'
import { TercerosTab } from './terceros-tab'
import { ImagenesTab } from './imagenes-tab'
import { TareasTab } from './tareas-tab'

interface OrdenTrabajoDetalle {
  id: number
  numeroOt: number
  maquinaNombre: string
  cantidad: number
  plano: string | null
  fecha: string
  fechaEjecucion: string | null
  referencia: string | null
  observaciones: string | null
  placa: string | null
  serie: string | null
  motor: string | null
  version: string | null
  estado: { nombre: string } | null
  ordenFabricacion: { id: number; numeroOf: number }
  maquina: { nombre: string } | null
}

export function OrdenesTrabajoShow() {
  const { id } = useParams()
  const otId = Number(id)
  const { result, query } = useShow<OrdenTrabajoDetalle>({ resource: 'ordenes-trabajo', id: otId })

  if (query.isLoading) return <p className="text-muted-foreground">Cargando...</p>
  if (!result) return <p className="text-muted-foreground">No encontrada</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">OT {result.numeroOt}</h1>
          <Link to={`/ordenes-fabricacion/${result.ordenFabricacion.id}`} className="text-sm text-muted-foreground hover:underline">
            OF {result.ordenFabricacion.numeroOf}
          </Link>
        </div>
        <Button asChild variant="outline">
          <Link to={`/ordenes-trabajo/${result.id}/editar`}>
            <Pencil />
            Editar
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid grid-cols-4 gap-4 pt-6 text-sm">
          <div>
            <p className="text-muted-foreground">Maquina</p>
            <p className="font-medium">{result.maquinaNombre}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cantidad</p>
            <p className="font-medium">{result.cantidad}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estado</p>
            {result.estado?.nombre ? <Badge variant="secondary">{result.estado.nombre}</Badge> : '-'}
          </div>
          <div>
            <p className="text-muted-foreground">Plano</p>
            <p className="font-medium">{result.plano ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha</p>
            <p className="font-medium">{result.fecha?.slice(0, 10)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ejecucion</p>
            <p className="font-medium">{result.fechaEjecucion?.slice(0, 10) ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Placa / Serie</p>
            <p className="font-medium">
              {result.placa ?? '-'} / {result.serie ?? '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Referencia</p>
            <p className="font-medium">{result.referencia ?? '-'}</p>
          </div>
          {result.observaciones && (
            <div className="col-span-4">
              <p className="text-muted-foreground">Observaciones</p>
              <p className="font-medium whitespace-pre-wrap">{result.observaciones}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="etapas">
        <TabsList>
          <TabsTrigger value="etapas">Etapas</TabsTrigger>
          <TabsTrigger value="terceros">Terceros</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="imagenes">Imagenes</TabsTrigger>
        </TabsList>
        <TabsContent value="etapas">
          <EtapasTab otId={otId} />
        </TabsContent>
        <TabsContent value="terceros">
          <TercerosTab otId={otId} />
        </TabsContent>
        <TabsContent value="tareas">
          <TareasTab otId={otId} />
        </TabsContent>
        <TabsContent value="imagenes">
          <ImagenesTab otId={otId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
