import { useCustom } from '@refinedev/core'

export interface CatalogoItem {
  id: number
  nombre: string
}

// Los endpoints /catalogos/* devuelven un array plano (no {data,total}),
// asi que se consultan con useCustom en vez de useList/useSelect.
export function useCatalogo(path: string) {
  const { result, query } = useCustom<CatalogoItem[]>({
    url: `/catalogos/${path}`,
    method: 'get',
  })
  // result.data no arranca en `undefined` mientras carga (viene como un
  // objeto/placeholder de react-query), asi que `?? []` no alcanza --
  // hace falta chequear explicitamente que sea un array.
  return { items: Array.isArray(result.data) ? result.data : [], isLoading: query.isLoading }
}
