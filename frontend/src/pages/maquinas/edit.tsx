import { useParams } from 'react-router-dom'
import { MaquinaForm } from './form'

export function MaquinasEdit() {
  const { id } = useParams()
  return <MaquinaForm id={Number(id)} />
}
