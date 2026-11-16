'use client'

import { type SuccessBody, unwrap } from '@repo/api-client'
import type { VillageSettingsPatch } from '@repo/validators'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

export type VillageSettings = SuccessBody<
  Awaited<ReturnType<(typeof api.v1.manage.villages)[':id']['$get']>>
>['data']

export const villageKeys = {
  settings: (id: string) => ['villages', 'settings', id] as const,
  list: (q: string) => ['villages', 'manage-list', q] as const,
}

const PAGE_SIZE = 30

/** Villages whose settings this person may open (super admin: all, drafts included). */
export function useVillageList(q: string) {
  return useInfiniteQuery({
    queryKey: villageKeys.list(q),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.v1.manage.villages.$get({
          query: { ...(q ? { q } : {}), page: String(pageParam), pageSize: String(PAGE_SIZE) },
        }),
      ),
    getNextPageParam: (last) =>
      last.meta.page * last.meta.pageSize < last.meta.total ? last.meta.page + 1 : undefined,
  })
}

/** "Pengaturan desa" of one village (its admins and assistants may read it). */
export function useVillageSettings(id: string | null) {
  return useQuery({
    queryKey: villageKeys.settings(id ?? ''),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    queryFn: async () =>
      (await unwrap(await api.v1.manage.villages[':id'].$get({ param: { id: id! } }))).data,
  })
}

export function useUpdateVillageSettings(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: VillageSettingsPatch) =>
      (await unwrap(await api.v1.manage.villages[':id'].$patch({ param: { id }, json: patch })))
        .data,
    onSuccess: (v) => {
      qc.setQueryData(villageKeys.settings(id), v)
      // Business pages show the village centre on their maps.
      void qc.invalidateQueries({ queryKey: ['businesses', 'one'] })
    },
  })
}
