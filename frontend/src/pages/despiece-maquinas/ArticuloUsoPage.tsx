import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Wrench } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Articulo {
  id: number
  nombre: string
}

interface UsoMaquina {
  maquinaId: number
  maquinaNombre: string
  planoId: string
  tipoMaquina: string | null
  fechaAlta: string
  usuario: { id: number; username: string; nombre: string | null } | null
  cantidadPiezas: number
}

// Vista pensada para Ingenieria: donde mas se usa este articulo, para
// confirmar reutilizacion entre maquinas antes de armar un despiece.
// A proposito NO muestra nada de costo/precio -- eso es de la ficha de
// Articulos que administra Compras (/articulos/:id).
export function ArticuloUsoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [articulo, setArticulo] = useState<Articulo | null>(null)
  const [usos, setUsos] = useState<UsoMaquina[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      apiClient.get(`/articulos/${id}`).then((res) => setArticulo(res.data)),
      apiClient.get(`/despiece-maquinas/uso-articulo/${id}`).then((res) => setUsos(res.data)),
    ]).finally(() => setLoading(false))
  }, [id])

  if (loading || !articulo) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{articulo.nombre}</h1>
          <p className="text-sm text-muted-foreground">Codigo {articulo.id} — Maquinas que usan este articulo</p>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Maquina</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha de alta</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Piezas vinculadas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Este articulo no esta vinculado al despiece de ninguna maquina
                </TableCell>
              </TableRow>
            )}
            {usos.map((u) => (
              <TableRow key={u.maquinaId}>
                <TableCell>
                  <Link to={`/maquinas/${u.maquinaId}/despiece`} className="flex items-center gap-1.5 text-primary hover:underline">
                    <Wrench className="h-3.5 w-3.5" />
                    {u.maquinaNombre}
                  </Link>
                  <span className="text-xs text-muted-foreground">Plano {u.planoId}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.tipoMaquina ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(u.fechaAlta).toLocaleDateString('es-AR')}</TableCell>
                <TableCell className="text-muted-foreground">{u.usuario?.nombre ?? u.usuario?.username ?? '-'}</TableCell>
                <TableCell className="font-medium">{u.cantidadPiezas}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
