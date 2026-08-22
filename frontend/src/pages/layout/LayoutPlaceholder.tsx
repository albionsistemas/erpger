import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// Pendiente de diseno: mapea al legacy 'lineas' / filter_lineas_config.php
// -- configuraciones estandar de agrupaciones de maquinas que Ventas
// ofrece, y que Ingenieria consulta y completa con planos. Falta definir
// el modelo de datos y las pantallas junto con el usuario antes de
// construirlo; por ahora solo esta el link en el sidebar.
export function LayoutPlaceholder() {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Layout</CardTitle>
        <CardDescription>Todavia no esta construido</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Va a mostrar las configuraciones estandar de agrupaciones de
        maquinas que Ventas ofrece ("ir por un estandar"), que Ingenieria
        consulta y completa con los planos correspondientes. Equivalente
        al legacy <code>lineas</code> / <code>filter_lineas_config.php</code>.
        Falta definir el modelo de datos y las pantallas.
      </CardContent>
    </Card>
  )
}
