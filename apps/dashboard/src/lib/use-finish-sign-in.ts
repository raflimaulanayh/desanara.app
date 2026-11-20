'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/** After any successful sign-in: forget the cached "not logged in" answer and go on. */
export function useFinishSignIn() {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useCallback(
    (next: string) => {
      queryClient.removeQueries({ queryKey: ['me'] })
      router.replace(next)
    },
    [queryClient, router],
  )
}
