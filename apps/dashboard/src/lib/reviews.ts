'use client'

import { type SuccessBody, unwrap } from '@repo/api-client'
import type { ReviewModerationInput } from '@repo/validators'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

export type ManageReview = SuccessBody<
  Awaited<ReturnType<typeof api.v1.manage.reviews.$get>>
>['data'][number]

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

/** Whose reviews a list shows: one village (moderators), one business (its members) or all (super admin). */
export type ReviewScope =
  | { kind: 'village'; id: string; name: string }
  | { kind: 'business'; id: string; name: string }
  | { kind: 'all'; name: string }

const PAGE_SIZE = 20

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (scope: string, status: ReviewStatus) => ['reviews', 'list', scope, status] as const,
}

export const scopeKey = (scope: ReviewScope) =>
  scope.kind === 'all' ? 'all' : `${scope.kind}:${scope.id}`

export function useReviewList(scope: ReviewScope | null, status: ReviewStatus) {
  return useInfiniteQuery({
    queryKey: reviewKeys.list(scope ? scopeKey(scope) : 'none', status),
    enabled: Boolean(scope),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.v1.manage.reviews.$get({
          query: {
            ...(scope?.kind === 'village' ? { villageId: scope.id } : {}),
            ...(scope?.kind === 'business' ? { businessId: scope.id } : {}),
            status,
            page: String(pageParam),
            pageSize: String(PAGE_SIZE),
          },
        }),
      ),
    getNextPageParam: (last) =>
      last.meta.page * last.meta.pageSize < last.meta.total ? last.meta.page + 1 : undefined,
  })
}

/** Approve or reject; every list and count is refreshed because the review moves between tabs. */
export function useModerateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: ReviewModerationInput & { id: string }) =>
      (await unwrap(await api.v1.manage.reviews[':id'].$patch({ param: { id }, json: input })))
        .data,
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.all }),
  })
}

export function useReplyToReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string | null }) =>
      (
        await unwrap(
          reply === null
            ? await api.v1.manage.reviews[':id'].reply.$delete({ param: { id } })
            : await api.v1.manage.reviews[':id'].reply.$put({ param: { id }, json: { reply } }),
        )
      ).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.all }),
  })
}
