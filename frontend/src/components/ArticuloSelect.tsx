import { useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ArticuloOption {
  id: number
  nombre: string
  codigoAlbion: string | null
  largoComercial?: number | null
}

interface ArticuloSelectProps {
  value?: number
  onChange: (id: number | undefined, articulo?: ArticuloOption) => void
  placeholder?: string
}

// Combobox con busqueda server-side: el catalogo de articulos puede
// tener miles de filas (viene del legacy), no se puede cargar entero en
// un <select>. El CRUD de articulos lo maneja Almacen; esto es solo
// lectura para elegir un articulo al armar una linea de despiece.
export function ArticuloSelect({ value, onChange, placeholder = 'Buscar articulo...' }: ArticuloSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [opciones, setOpciones] = useState<ArticuloOption[]>([])
  const [loading, setLoading] = useState(false)
  const [seleccionado, setSeleccionado] = useState<ArticuloOption | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Trae el nombre del articulo ya seleccionado (ej. al editar una fila existente)
  useEffect(() => {
    if (value === undefined) {
      setSeleccionado(null)
      return
    }
    if (seleccionado?.id === value) return
    apiClient.get(`/articulos/${value}`).then((res) => setSeleccionado(res.data))
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    setLoading(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      apiClient
        .get('/articulos', { params: { buscar: query, limit: 15 } })
        .then((res) => setOpciones(res.data.data))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(debounceRef.current)
  }, [query, open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between font-normal"
          onClick={() => setOpen(true)}
        >
          <span className="truncate">{seleccionado ? seleccionado.nombre : placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="border-b p-2">
          <Input autoFocus placeholder="Escribi para buscar..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </div>
          )}
          {!loading && opciones.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Sin resultados</p>
          )}
          {!loading &&
            opciones.map((op) => (
              <button
                key={op.id}
                type="button"
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                  op.id === value && 'bg-accent',
                )}
                onClick={() => {
                  onChange(op.id, op)
                  setSeleccionado(op)
                  setOpen(false)
                }}
              >
                <Check className={cn('h-4 w-4 shrink-0', op.id === value ? 'opacity-100' : 'opacity-0')} />
                <span className="flex-1 truncate">{op.nombre}</span>
                {op.codigoAlbion && <span className="text-xs text-muted-foreground">{op.codigoAlbion}</span>}
              </button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
