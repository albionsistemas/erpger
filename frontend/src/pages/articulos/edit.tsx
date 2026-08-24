import { useParams } from 'react-router-dom'
import { ArticuloForm } from './form'

export function ArticulosEdit() {
  const { id } = useParams()
  return <ArticuloForm id={Number(id)} />
}
