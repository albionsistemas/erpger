import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { labelTipoCorte } from '@/lib/despiece-cod'
import { calcularCompra, type DespieceLinea, type Grupo } from './despiece-helpers'

function Codigo({ l }: { l: DespieceLinea }) {
  return l.articuloId ? (
    <span className="font-medium text-green-600">{l.articuloId}</span>
  ) : (
    <span className="font-medium text-red-600">sin codigo</span>
  )
}

function ArticuloCelda({ l, mostrarDenominacion }: { l: DespieceLinea; mostrarDenominacion?: boolean }) {
  return (
    <div className="flex flex-col">
      {l.articulo ? (
        <Link to={`/articulos/${l.articulo.id}`} className="text-primary hover:underline">
          {l.articulo.nombre}
        </Link>
      ) : (
        <span>{l.articuloTexto || '-'}</span>
      )}
      {mostrarDenominacion && l.denominacion && <span className="text-xs text-muted-foreground">{l.denominacion}</span>}
    </div>
  )
}

export type ColDetalle =
  | 'item'
  | 'codigo'
  | 'pl'
  | 'articulo'
  | 'denominacion'
  | 'ancho'
  | 'largo'
  | 'cant'
  | 'corte'
  | 'nota'
  | 'obs'

const HEADS: Record<ColDetalle, string> = {
  item: 'Item',
  codigo: 'Codigo',
  pl: 'PL',
  articulo: 'Articulo',
  denominacion: 'Denominacion',
  ancho: 'Ancho',
  largo: 'Largo',
  cant: 'Cant',
  corte: 'Corte',
  nota: 'Nota',
  obs: 'Obs',
}

interface DetailTableProps {
  titulo?: string
  subtitulo?: string
  lineas: DespieceLinea[]
  columnas: ColDetalle[]
  acciones?: 'full' | 'editar' | 'ninguna'
  onEditar?: (l: DespieceLinea) => void
  onEliminar?: (l: DespieceLinea) => void
  denominacionEnArticulo?: boolean
}

export function DetailTable({
  titulo,
  subtitulo,
  lineas,
  columnas,
  acciones = 'ninguna',
  onEditar,
  onEliminar,
  denominacionEnArticulo,
}: DetailTableProps) {
  const cols = columnas.length + (acciones !== 'ninguna' ? 1 : 0)
  return (
    <div className="flex flex-col gap-2">
      {titulo && <h3 className="text-sm font-semibold">{titulo}</h3>}
      {subtitulo && <p className="text-xs text-muted-foreground">{subtitulo}</p>}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {columnas.map((c) => (
                <TableHead key={c}>{HEADS[c]}</TableHead>
              ))}
              {acciones !== 'ninguna' && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineas.length === 0 && (
              <TableRow>
                <TableCell colSpan={cols} className="text-center text-muted-foreground">
                  Sin lineas
                </TableCell>
              </TableRow>
            )}
            {lineas.map((l) => (
              <TableRow key={l.id}>
                {columnas.map((c) => (
                  <TableCell
                    key={c}
                    className={
                      c === 'articulo'
                        ? denominacionEnArticulo
                          ? 'max-w-56'
                          : 'max-w-56 truncate'
                        : c === 'denominacion'
                          ? 'max-w-56 truncate'
                          : undefined
                    }
                  >
                    {c === 'item' && l.item}
                    {c === 'codigo' && <Codigo l={l} />}
                    {c === 'pl' && (l.piezaCodigo ?? '-')}
                    {c === 'articulo' && <ArticuloCelda l={l} mostrarDenominacion={denominacionEnArticulo} />}
                    {c === 'denominacion' && (l.denominacion ?? '-')}
                    {c === 'ancho' && (l.anchoMm ?? '-')}
                    {c === 'largo' && (l.largoMm ?? '-')}
                    {c === 'cant' && l.cantidad}
                    {c === 'corte' && (l.tipoCorte ? labelTipoCorte(l.tipoCorte) : '-')}
                    {c === 'nota' && (l.nota ?? '-')}
                    {c === 'obs' && (l.observacionesCorte ?? '-')}
                  </TableCell>
                ))}
                {acciones !== 'ninguna' && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onEditar?.(l)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {acciones === 'full' && (
                        <Button variant="ghost" size="icon" onClick={() => onEliminar?.(l)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

interface GroupTableProps {
  titulo?: string
  subtitulo?: string
  grupos: Grupo[]
  mostrarNota?: boolean
  mostrarCalculo?: boolean
  unidad?: 'mm' | 'mm²'
}

export function GroupTable({ titulo, subtitulo, grupos, mostrarNota, mostrarCalculo, unidad = 'mm' }: GroupTableProps) {
  return (
    <div className="flex flex-col gap-2">
      {titulo && <h3 className="text-sm font-semibold">{titulo}</h3>}
      {subtitulo && <p className="text-xs text-muted-foreground">{subtitulo}</p>}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo</TableHead>
              <TableHead>Articulo</TableHead>
              <TableHead>Cantidad</TableHead>
              {mostrarNota && <TableHead>Nota</TableHead>}
              {mostrarCalculo && (
                <>
                  <TableHead>Comercial</TableHead>
                  <TableHead>A comprar</TableHead>
                  <TableHead>% Aprovechamiento</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {grupos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2 + 1 + (mostrarNota ? 1 : 0) + (mostrarCalculo ? 3 : 0)}
                  className="text-center text-muted-foreground"
                >
                  Sin lineas
                </TableCell>
              </TableRow>
            )}
            {grupos.map((g) => {
              const calc = mostrarCalculo ? calcularCompra(g) : null
              return (
                <TableRow key={g.clave}>
                  <TableCell>
                    {g.articuloId ? <span className="font-medium text-green-600">{g.articuloId}</span> : '-'}
                  </TableCell>
                  <TableCell className="font-medium">{g.nombre}</TableCell>
                  <TableCell>{g.cantidad}</TableCell>
                  {mostrarNota && <TableCell className="text-muted-foreground">{g.nota ?? '-'}</TableCell>}
                  {mostrarCalculo && (
                    <>
                      <TableCell className="text-muted-foreground">
                        {g.metrosLargoTotal ? `${g.metrosLargoTotal} ${unidad}` : '-'}
                      </TableCell>
                      <TableCell>{calc ? calc.division : '-'}</TableCell>
                      <TableCell>{calc ? `${calc.efectividad}%` : '-'}</TableCell>
                    </>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
