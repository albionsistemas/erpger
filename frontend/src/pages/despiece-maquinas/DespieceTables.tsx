import { Link } from 'react-router-dom'
import { Pencil, Trash2, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { labelTipoCorte } from '@/lib/despiece-cod'
import { esNuevo } from '@/lib/nuevo'
import { imagenArticulo } from '@/lib/articulo-imagen'
import { NewBadge } from '@/components/NewBadge'
import { calcularCompra, categoriaResaltada, type DespieceLinea, type Grupo } from './despiece-helpers'

const COLOR_CATEGORIA: Record<NonNullable<ReturnType<typeof categoriaResaltada>>, string> = {
  comercial: 'text-blue-600',
  mecanizado: 'text-orange-600',
  'pieza-comun': 'text-purple-600',
  chapa: 'text-teal-600',
}

function colorArticulo(l: DespieceLinea): string {
  const cat = categoriaResaltada(l)
  return cat ? COLOR_CATEGORIA[cat] : 'text-primary'
}

function ImagenCelda({ l }: { l: DespieceLinea }) {
  const src = l.articulo ? imagenArticulo(l.articulo) : null
  return src ? (
    <img src={src} alt={l.articulo!.nombre} className="h-9 w-9 rounded object-cover border" />
  ) : (
    <div className="flex h-9 w-9 items-center justify-center rounded border border-dashed text-muted-foreground">
      <ImageOff className="h-3.5 w-3.5" />
    </div>
  )
}

function Codigo({ l }: { l: DespieceLinea }) {
  return l.articuloId ? (
    <span className="font-medium text-green-600">{l.articuloId}</span>
  ) : (
    <span className="font-medium text-red-600">sin codigo</span>
  )
}

function ArticuloCelda({ l, mostrarDenominacion }: { l: DespieceLinea; mostrarDenominacion?: boolean }) {
  const color = colorArticulo(l)
  return (
    <div className="flex flex-col">
      {l.articulo ? (
        <span>
          <Link to={`/articulos/${l.articulo.id}/uso-en-maquinas`} className={`${color} hover:underline`}>
            {l.articulo.nombre}
          </Link>
          {esNuevo(l.articulo.creadoEn) && <NewBadge />}
        </span>
      ) : (
        <span className={color !== 'text-primary' ? `font-medium ${color}` : undefined}>{l.articuloTexto || '-'}</span>
      )}
      {mostrarDenominacion && l.denominacion && <span className="text-xs text-muted-foreground">{l.denominacion}</span>}
    </div>
  )
}

export type ColDetalle =
  | 'imagen'
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
  imagen: 'Imagen',
  item: 'Item',
  codigo: 'Codigo',
  pl: 'PL',
  articulo: 'Articulo',
  denominacion: 'Denominacion',
  ancho: 'Ancho',
  largo: 'Largo',
  cant: 'Cant',
  corte: 'Tipo',
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
                    {c === 'imagen' && <ImagenCelda l={l} />}
                    {c === 'item' && l.item}
                    {c === 'codigo' && <Codigo l={l} />}
                    {c === 'pl' && (l.piezaCodigo ?? '-')}
                    {c === 'articulo' && <ArticuloCelda l={l} mostrarDenominacion={denominacionEnArticulo} />}
                    {c === 'denominacion' && (l.denominacion ?? '-')}
                    {c === 'ancho' && (l.anchoMm ?? '-')}
                    {c === 'largo' && (l.largoMm ?? '-')}
                    {c === 'cant' && l.cantidad}
                    {c === 'corte' &&
                      (l.tipoCorte ? (
                        <span title={labelTipoCorte(l.tipoCorte)}>{l.tipoCorte.toUpperCase()}</span>
                      ) : (
                        '-'
                      ))}
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
