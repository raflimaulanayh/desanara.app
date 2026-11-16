'use client'

import { type SuccessBody, unwrap } from '@repo/api-client'
import type { BusinessCreateInput, BusinessUpdateInput } from '@repo/validators'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

export type Business = SuccessBody<
  Awaited<ReturnType<(typeof api.v1.manage.businesses)[':id']['$get']>>
>['data']

export interface BusinessFilters {
  q?: string
  status?: 'draft' | 'published'
  verificationStatus?: 'pending' | 'verified' | 'rejected'
  villageId?: string
}

const PAGE_SIZE = 20

export const businessKeys = {
  all: ['businesses'] as const,
  list: (f: BusinessFilters) => ['businesses', 'list', f] as const,
  one: (id: string) => ['businesses', 'one', id] as const,
}

/** Paged list ("Muat lagi"), scoped by the API to what the user may see. */
export function useBusinessList(filters: BusinessFilters) {
  return useInfiniteQuery({
    queryKey: businessKeys.list(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.v1.manage.businesses.$get({
          query: {
            ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
            page: String(pageParam),
            pageSize: String(PAGE_SIZE),
          },
        }),
      ),
    getNextPageParam: (last) =>
      last.meta.page * last.meta.pageSize < last.meta.total ? last.meta.page + 1 : undefined,
  })
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: businessKeys.one(id),
    queryFn: async () =>
      (await unwrap(await api.v1.manage.businesses[':id'].$get({ param: { id } }))).data,
  })
}

/** Writes the fresh row into the cache and marks lists (and home counts) stale. */
function useStore() {
  const qc = useQueryClient()
  return (b: Business) => {
    qc.setQueryData(businessKeys.one(b.id), b)
    void qc.invalidateQueries({ queryKey: ['businesses', 'list'] })
    void qc.invalidateQueries({ queryKey: ['businesses', 'count'] })
  }
}

export function useCreateBusiness() {
  const store = useStore()
  return useMutation({
    mutationFn: async (input: BusinessCreateInput) =>
      (await unwrap(await api.v1.manage.businesses.$post({ json: input }))).data,
    onSuccess: store,
  })
}

export function useUpdateBusiness(id: string) {
  const store = useStore()
  return useMutation({
    mutationFn: async (patch: BusinessUpdateInput) =>
      (await unwrap(await api.v1.manage.businesses[':id'].$patch({ param: { id }, json: patch })))
        .data,
    onSuccess: store,
  })
}

export type BusinessAction =
  | { type: 'publish' | 'unpublish' | 'restore' }
  | { type: 'verify'; decision: 'verified' | 'rejected'; note?: string }
  | { type: 'takedown'; reason: string }

export function useBusinessAction(id: string) {
  const store = useStore()
  return useMutation({
    mutationFn: async (a: BusinessAction) => {
      const r = api.v1.manage.businesses[':id']
      const param = { id }
      switch (a.type) {
        case 'publish':
          return (await unwrap(await r.publish.$post({ param }))).data
        case 'unpublish':
          return (await unwrap(await r.unpublish.$post({ param }))).data
        case 'restore':
          return (await unwrap(await r.restore.$post({ param }))).data
        case 'verify':
          return (
            await unwrap(
              await r.verify.$post({ param, json: { decision: a.decision, note: a.note } }),
            )
          ).data
        case 'takedown':
          return (await unwrap(await r.takedown.$post({ param, json: { reason: a.reason } }))).data
      }
    },
    onSuccess: store,
  })
}

export function useDeleteBusiness(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.v1.manage.businesses[':id'].$delete({ param: { id } })
      if (!res.ok) await unwrap(res)
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: businessKeys.one(id) })
      void qc.invalidateQueries({ queryKey: businessKeys.all })
    },
  })
}
