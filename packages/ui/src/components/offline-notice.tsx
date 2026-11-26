'use client'

import { useSyncExternalStore } from 'react'

function subscribe(listener: () => void) {
  window.addEventListener('online', listener)
  window.addEventListener('offline', listener)
  return () => {
    window.removeEventListener('online', listener)
    window.removeEventListener('offline', listener)
  }
}

export function useOnline() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
}

export function OfflineNotice({ message }: { message: string }) {
  const online = useOnline()
  return online ? null : (
    <p
      role="status"
      className="bg-wash text-foreground px-4 py-2 text-center text-xs font-semibold sm:text-sm"
    >
      {message}
    </p>
  )
}
