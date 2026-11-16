'use client'

import { type SuccessBody, unwrap } from '@repo/api-client'
import type { ProductCreateInput, ProductUpdateInput } from '@repo/validators'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { businessKeys } from './businesses'

export type Product = SuccessBody<
  Awaited<ReturnType<(typeof api.v1.manage.products)[':id']['$get']>>
>['data']

export type Category = SuccessBody<
  Awaited<ReturnType<typeof api.v1.categories.$get>>
>['data'][number]

const PAGE_SIZE = 30

export const productKeys = {
  all: ['products'] as const,
  list: (businessId: string) => ['products', 'list', businessId] as const,
  one: (id: string) => ['products', 'one', id] as const,
}

/** Every product of one business, drafts included (the API checks `business.view`). */
export function useProductList(businessId: string) {
  return useInfiniteQuery({
    queryKey: productKeys.list(businessId),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.v1.manage.businesses[':businessId'].products.$get({
          param: { businessId },
          query: { page: String(pageParam), pageSize: String(PAGE_SIZE) },
        }),
      ),
    getNextPageParam: (last) =>
      last.meta.page * last.meta.pageSize < last.meta.total ? last.meta.page + 1 : undefined,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.one(id),
    queryFn: async () =>
      (await unwrap(await api.v1.manage.products[':id'].$get({ param: { id } }))).data,
  })
}

/** Product categories (public, rarely change). */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    staleTime: 60 * 60 * 1000,
    queryFn: async () => (await unwrap(await api.v1.categories.$get())).data,
  })
}

/** Writes the fresh row into the cache and marks the business's list and counts stale. */
function useStore() {
  const qc = useQueryClient()
  return (p: Product) => {
    qc.setQueryData(productKeys.one(p.id), p)
    void qc.invalidateQueries({ queryKey: productKeys.list(p.business.id) })
    void qc.invalidateQueries({ queryKey: businessKeys.one(p.business.id) })
  }
}

export function useCreateProduct(businessId: string) {
  const store = useStore()
  return useMutation({
    mutationFn: async (input: ProductCreateInput) =>
      (
        await unwrap(
          await api.v1.manage.businesses[':businessId'].products.$post({
            param: { businessId },
            json: input,
          }),
        )
      ).data,
    onSuccess: store,
  })
}

export function useUpdateProduct(id: string) {
  const store = useStore()
  return useMutation({
    mutationFn: async (patch: ProductUpdateInput) =>
      (await unwrap(await api.v1.manage.products[':id'].$patch({ param: { id }, json: patch })))
        .data,
    onSuccess: store,
  })
}

export function useProductAction(id: string) {
  const store = useStore()
  return useMutation({
    mutationFn: async (type: 'publish' | 'unpublish') => {
      const r = api.v1.manage.products[':id']
      return (await unwrap(await r[type].$post({ param: { id } }))).data
    },
    onSuccess: store,
  })
}

/** Photo order: every image id once, cover first. */
export function useReorderImages(id: string) {
  const store = useStore()
  return useMutation({
    mutationFn: async (order: string[]) =>
      (
        await unwrap(
          await api.v1.manage.products[':id'].images.$patch({ param: { id }, json: { order } }),
        )
      ).data,
    onSuccess: store,
  })
}

/** Re-reads one product after uploads or removals changed its photos (`id` may be given at call time). */
export function useRefreshProduct(defaultId?: string) {
  const qc = useQueryClient()
  return async (id = defaultId) => {
    if (!id) return
    await qc.invalidateQueries({ queryKey: productKeys.one(id) })
    const p = qc.getQueryData<Product>(productKeys.one(id))
    if (p) void qc.invalidateQueries({ queryKey: productKeys.list(p.business.id) })
  }
}

export function useRemoveImage(productId: string) {
  const refresh = useRefreshProduct(productId)
  return useMutation({
    mutationFn: async (key: string) =>
      unwrap(
        await api.v1.manage.media.$delete({
          query: { target: 'product_image', id: productId, key },
        }),
      ),
    onSuccess: () => refresh(),
  })
}

export function useDeleteProduct(product: Pick<Product, 'id' | 'business'>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.v1.manage.products[':id'].$delete({ param: { id: product.id } })
      if (!res.ok) await unwrap(res)
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: productKeys.one(product.id) })
      void qc.invalidateQueries({ queryKey: productKeys.list(product.business.id) })
      void qc.invalidateQueries({ queryKey: businessKeys.one(product.business.id) })
    },
  })
}
