import { ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// Guarda de pagina completa para rutas de crear/editar a las que se
// puede llegar directo por URL (bookmark, historial) sin pasar por el
// boton de la lista (que ya se oculta segun permiso). El backend igual
// rechaza la accion con 403 -- esto evita mostrar un formulario
// funcional que va a fallar al guardar.
export function SinPermiso() {
  return (
    <Card className="max-w-lg">
      <CardContent className="flex items-center gap-3 py-6 text-muted-foreground">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <p>No tenes permiso de edicion en este modulo.</p>
      </CardContent>
    </Card>
  )
}
