import { useShow } from '@refinedev/core'
import { useParams, Link } from 'react-router-dom'
import { Pencil, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface MaquinaDetalle {
  id: number
  planoId: string
  nombre: string
  detalle: string | null
  descripcion: string | null
  usos: string | null
  anchoMm: number | null
  largoMm: number | null
  altoMm: number | null
  capacidad: number | null
  imagenUrl: string | null
  tipoMaquina: { nombre: string } | null
}

export function MaquinasShow() {
  const { id } = useParams()
  const { result, query } = useShow<MaquinaDetalle>({ resource: 'maquinas', id: Number(id) })

  if (query.isLoading) return <p className="text-muted-foreground">Cargando...</p>
  if (!result) return <p className="text-muted-foreground">No encontrada</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{result.nombre}</h1>
        <Button asChild variant="outline">
          <Link to={`/maquinas/${result.id}/editar`}>
            <Pencil />
            Editar
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid grid-cols-3 gap-4 pt-6 text-sm">
          <div>
            <p className="text-muted-foreground">Plano</p>
            <p className="font-medium">{result.planoId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tipo</p>
            <p className="font-medium">{result.tipoMaquina?.nombre ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Detalle</p>
            <p className="font-medium">{result.detalle ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dimensiones (A x L x H mm)</p>
            <p className="font-medium">
              {result.anchoMm ?? '-'} x {result.largoMm ?? '-'} x {result.altoMm ?? '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Capacidad</p>
            <p className="font-medium">{result.capacidad ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Usos</p>
            <p className="font-medium">{result.usos ?? '-'}</p>
          </div>
          {result.descripcion && (
            <div className="col-span-3">
              <p className="text-muted-foreground">Descripcion</p>
              <p className="font-medium whitespace-pre-wrap">{result.descripcion}</p>
            </div>
          )}
          <div className="col-span-3">
            <p className="mb-1 text-muted-foreground">Imagen</p>
            {result.imagenUrl ? (
              <img src={result.imagenUrl} alt={result.nombre} className="max-w-xs rounded-md border" />
            ) : (
              <div className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground">
                <ImageOff className="h-6 w-6" />
                <span className="text-xs">Sin imagen</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
