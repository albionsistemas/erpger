import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Imagen {
  id: number
  url: string
  orden: number
}

// Por ahora se agrega por URL (mismo criterio que el legacy: ruta de
// archivo, no upload directo). Si mas adelante se agrega upload real de
// fotos de OT, este componente cambia a un input de tipo file.
export function ImagenesTab({ otId }: { otId: number }) {
  const [imagenes, setImagenes] = useState<Imagen[]>([])
  const [url, setUrl] = useState('')

  const load = () => {
    apiClient.get(`/ordenes-trabajo/${otId}/imagenes`).then((res) => setImagenes(res.data))
  }

  useEffect(load, [otId])

  const agregar = async () => {
    if (!url) return
    await apiClient.post(`/ordenes-trabajo/${otId}/imagenes`, { url })
    setUrl('')
    load()
  }

  const eliminar = async (id: number) => {
    await apiClient.delete(`/ordenes-trabajo/${otId}/imagenes/${id}`)
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-muted-foreground">URL de imagen</label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/uploads/..." />
        </div>
        <Button onClick={agregar}>
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {imagenes.map((img) => (
          <div key={img.id} className="relative overflow-hidden rounded-md border">
            <img src={img.url} alt="" className="aspect-square w-full object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={() => eliminar(img.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {imagenes.length === 0 && <p className="col-span-4 text-center text-muted-foreground">Sin imagenes</p>}
      </div>
    </div>
  )
}
