import { useParams } from 'react-router-dom'
import { OperarioForm } from './form'

export function OperariosEdit() {
  const { id } = useParams()
  return <OperarioForm id={Number(id)} />
}
