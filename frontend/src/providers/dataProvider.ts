import type { DataProvider } from '@refinedev/core'
import { apiClient } from '@/lib/api-client'

// Adapta el DataProvider generico de Refine a la forma de nuestra API
// NestJS: paginado {data,total,page,limit}, filtros como query params
// planos (no la convencion json-server de simple-rest). Los sub-recursos
// anidados (ej: /ordenes-trabajo/:id/etapas) NO pasan por aca — se
// consultan directo con apiClient donde hacen falta (ver pages/ordenes-trabajo).
export const dataProvider: DataProvider = {
  getApiUrl: () => '/api',

  getList: async ({ resource, pagination, filters, sorters }) => {
    const params: Record<string, unknown> = {}

    if (pagination?.mode !== 'off') {
      params.page = pagination?.currentPage ?? 1
      params.limit = pagination?.pageSize ?? 20
    }

    filters?.forEach((filter) => {
      if ('field' in filter && filter.value !== undefined && filter.value !== '') {
        params[filter.field] = filter.value
      }
    })

    // Nuestra API no soporta multi-sort generico; se usa el primero si viene.
    if (sorters && sorters.length > 0) {
      params.sortField = sorters[0].field
      params.sortOrder = sorters[0].order
    }

    const { data } = await apiClient.get(`/${resource}`, { params })
    return { data: data.data, total: data.total }
  },

  getOne: async ({ resource, id }) => {
    const { data } = await apiClient.get(`/${resource}/${id}`)
    return { data }
  },

  getMany: async ({ resource, ids }) => {
    const results = await Promise.all(ids.map((id) => apiClient.get(`/${resource}/${id}`)))
    return { data: results.map((r) => r.data) }
  },

  create: async ({ resource, variables }) => {
    const { data } = await apiClient.post(`/${resource}`, variables)
    return { data }
  },

  update: async ({ resource, id, variables }) => {
    const { data } = await apiClient.patch(`/${resource}/${id}`, variables)
    return { data }
  },

  deleteOne: async ({ resource, id }) => {
    await apiClient.delete(`/${resource}/${id}`)
    return { data: { id } as never }
  },

  custom: async ({ url, method, payload, query }) => {
    const { data } = await apiClient.request({ url, method, data: payload, params: query })
    return { data }
  },
}
