import { useParams } from 'react-router-dom'
import { OrdenFabricacionForm } from './form'

export function OrdenesFabricacionEdit() {
  const { id } = useParams()
  return <OrdenFabricacionForm id={Number(id)} />
}
