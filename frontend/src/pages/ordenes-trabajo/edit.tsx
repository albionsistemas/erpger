import { useParams } from 'react-router-dom'
import { OrdenTrabajoForm } from './form'

export function OrdenesTrabajoEdit() {
  const { id } = useParams()
  return <OrdenTrabajoForm id={Number(id)} />
}
