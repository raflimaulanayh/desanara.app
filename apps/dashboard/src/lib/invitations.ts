'use client'

import { type SuccessBody, unwrap } from '@repo/api-client'
import type { InvitationCreateInput } from '@repo/validators'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

export type InvitationScope = { villageId: string } | { businessId: string }
export type CreatedInvitation = SuccessBody<
  Awaited<ReturnType<typeof api.v1.manage.invitations.$post>>
>['data']

const key = (scope: InvitationScope) => ['invitations', scope] as const

/** Pending invitations of a village (its staff) or a business. */
export function usePendingInvitations(scope: InvitationScope, enabled = true) {
  return useQuery({
    queryKey: key(scope),
    enabled,
    queryFn: async () =>
      (await unwrap(await api.v1.manage.invitations.$get({ query: scope }))).data,
  })
}

export function useCreateInvitation(scope: InvitationScope) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: InvitationCreateInput) =>
      (await unwrap(await api.v1.manage.invitations.$post({ json: input }))).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key(scope) }),
  })
}

export function useRevokeInvitation(scope: InvitationScope) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.v1.manage.invitations[':id'].$delete({ param: { id } })
      if (!res.ok) await unwrap(res as never)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(scope) }),
  })
}

/** The WhatsApp message that carries the link (no number: the sender picks the chat). */
export function invitationWhatsAppUrl(inv: {
  url: string
  roleLabel: string
  targetName: string
  inviteeName: string | null
}): string {
  const hello = inv.inviteeName ? `Halo ${inv.inviteeName},` : 'Halo,'
  const text = `${hello} kamu diundang sebagai ${inv.roleLabel} untuk ${inv.targetName} di Desanara. Buat akun lewat tautan ini (berlaku 7 hari, sekali pakai): ${inv.url}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
