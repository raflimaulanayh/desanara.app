'use client'

import { mediaRules } from '@repo/validators'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { describeApiError } from './api-errors'
import { moveItem } from './product-form'
import { UploadError, uploadImage } from './upload-image'

export interface QueuedPhoto {
  id: string
  file: File
  /** Object URL for the thumbnail; revoked when the item leaves the queue. */
  preview: string
  status: 'waiting' | 'uploading' | 'failed'
  progress: number
  error?: string
}

export const MAX_PHOTOS = mediaRules.product_image.maxCount

/**
 * Photos waiting to be uploaded for one product. Uploads run one at a time (village signal is
 * weak; a failure costs one photo, not all) and only once the product exists: a new product
 * queues its photos while the form is filled and calls `start(id)` after it is saved. Each finished
 * photo calls `onUploaded(productId)` so the product is re-read and the photo joins the saved list.
 *
 * The queue lives in a ref (what the upload loop reads) mirrored into state (what renders), so the
 * loop never works on a stale copy and nothing is started from an effect.
 */
export function usePhotoUploads({
  productId,
  savedCount,
  onUploaded,
}: {
  productId: string | null
  savedCount: number
  onUploaded: (productId: string) => Promise<void> | void
}) {
  const t = useTranslations()
  const items = useRef<QueuedPhoto[]>([])
  const [queue, setQueue] = useState<QueuedPhoto[]>([])
  const target = useRef<string | null>(productId)
  /** False while a new product is not saved yet: its photos wait for `start`. */
  const [started, setStarted] = useState(Boolean(productId))
  const running = useRef(false)
  const uploaded = useRef(onUploaded)

  useEffect(() => {
    uploaded.current = onUploaded
    if (productId) target.current = productId
  })

  const commit = (next: QueuedPhoto[]) => {
    items.current = next
    setQueue(next)
  }
  const patch = (id: string, change: Partial<QueuedPhoto>) =>
    commit(items.current.map((p) => (p.id === id ? { ...p, ...change } : p)))

  function remove(id: string) {
    const item = items.current.find((p) => p.id === id)
    if (item) URL.revokeObjectURL(item.preview)
    commit(items.current.filter((p) => p.id !== id))
  }

  async function pump() {
    const productId = target.current
    if (running.current || !productId) return
    running.current = true
    try {
      for (;;) {
        const next = items.current.find((p) => p.status === 'waiting')
        if (!next) break
        patch(next.id, { status: 'uploading', progress: 0 })
        try {
          await uploadImage({
            target: 'product_image',
            id: productId,
            file: next.file,
            onProgress: (progress) => patch(next.id, { progress }),
          })
          await uploaded.current(productId)
          remove(next.id)
        } catch (e) {
          const error = e instanceof UploadError ? e.message : describeApiError(e, t).message
          patch(next.id, { status: 'failed', error })
        }
      }
    } finally {
      running.current = false
    }
  }

  /** Adds files up to the 10-photo limit and starts uploading if the product exists; returns how many did not fit. */
  function add(files: FileList | File[]): number {
    const room = Math.max(0, MAX_PHOTOS - savedCount - items.current.length)
    const list = Array.from(files)
    const accepted = list.slice(0, room).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'waiting' as const,
      progress: 0,
    }))
    commit([...items.current, ...accepted])
    void pump()
    return list.length - accepted.length
  }

  function retry(id: string) {
    patch(id, { status: 'waiting', progress: 0, error: undefined })
    void pump()
  }

  /** New product: it now exists, upload what was queued. */
  function start(id: string) {
    target.current = id
    setStarted(true)
    void pump()
  }

  const move = (from: number, to: number) => commit(moveItem(items.current, from, to))

  // Revoke every preview URL when the page goes away.
  useEffect(() => () => items.current.forEach((p) => URL.revokeObjectURL(p.preview)), [])

  const busy = queue.some((p) => p.status === 'waiting' || p.status === 'uploading')

  // Closing the tab mid-upload loses the remaining photos: let the browser ask first.
  useEffect(() => {
    if (!busy) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [busy])

  return {
    queue,
    add,
    retry,
    remove,
    move,
    start,
    started,
    busy,
    failed: queue.filter((p) => p.status === 'failed').length,
  }
}

export type PhotoUploads = ReturnType<typeof usePhotoUploads>
