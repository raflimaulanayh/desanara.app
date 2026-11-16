'use client'

import { Button } from '@heroui/react'
import { ChevronLeft, ChevronRight, ImagePlus, RotateCcw, Star, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { mediaUrl } from '@/lib/media'
import { MAX_PHOTOS, type PhotoUploads } from '@/lib/use-photo-uploads'

export interface SavedPhoto {
  id: string
  key: string
}

interface Tile {
  key: string
  src: string
  saved?: SavedPhoto
  queued?: PhotoUploads['queue'][number]
}

function IconButton({
  label,
  onPress,
  isDisabled,
  children,
}: {
  label: string
  onPress: () => void
  isDisabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Button
      isIconOnly
      size="sm"
      variant="ghost"
      aria-label={label}
      isDisabled={isDisabled}
      onPress={onPress}
      className="size-9 min-w-9"
    >
      {children}
    </Button>
  )
}

/**
 * Product photos as a grid: saved photos first (in display order, the first one is the cover),
 * then photos still waiting or uploading. Every action is a button with a text label for screen
 * readers; no drag-and-drop, which is fiddly on cheap phones.
 *
 * - `saved` + `onReorder`/`onRemove`: photos already stored (edit page).
 * - `uploads`: the queue; on a new product it is the only list and its order becomes the upload order.
 */
export function PhotoManager({
  saved,
  uploads,
  onReorder,
  onRemove,
  busy,
  canEdit,
}: {
  saved: SavedPhoto[]
  uploads: PhotoUploads
  onReorder?: (order: string[]) => void
  onRemove?: (photo: SavedPhoto) => Promise<void>
  busy?: boolean
  canEdit: boolean
}) {
  const t = useTranslations()
  const input = useRef<HTMLInputElement>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const tiles: Tile[] = [
    ...saved.map((s) => ({ key: s.id, src: mediaUrl(s.key) ?? '', saved: s })),
    ...uploads.queue.map((q) => ({ key: q.id, src: q.preview, queued: q })),
  ]
  const full = tiles.length >= MAX_PHOTOS
  // Local ordering applies only while nothing is saved yet (new product).
  const localOrder = saved.length === 0

  function moveSaved(index: number, to: number) {
    const ids = saved.map((s) => s.id)
    const [id] = ids.splice(index, 1)
    ids.splice(to, 0, id!)
    onReorder?.(ids)
  }

  function move(tile: Tile, index: number, to: number) {
    if (tile.saved) return moveSaved(index, to)
    if (localOrder) uploads.move(index, to)
  }

  const canMove = (tile: Tile) =>
    canEdit &&
    !busy &&
    (tile.saved ? Boolean(onReorder) : localOrder && tile.queued?.status !== 'uploading')
  // Last index a photo can move to: the end of the queue (new product) or of the saved photos.
  const lastMovable = localOrder ? tiles.length - 1 : saved.length - 1

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-sm">{t('photos.hint')}</p>

      {tiles.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiles.map((tile, i) => {
            const q = tile.queued
            const isCover = i === 0
            return (
              <li key={tile.key} className="flex flex-col gap-1">
                <div className="bg-wash relative aspect-square overflow-hidden rounded-xl">
                  {tile.src ? (
                    <Image
                      src={tile.src}
                      alt={t('photos.alt', { index: i + 1 })}
                      fill
                      unoptimized
                      sizes="(min-width: 640px) 200px, 45vw"
                      className={`object-cover ${q && q.status !== 'failed' ? 'opacity-60' : ''}`}
                    />
                  ) : null}
                  {isCover ? (
                    <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-bold text-white">
                      {t('photos.cover')}
                    </span>
                  ) : null}
                  {q ? (
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-xs font-semibold text-white">
                      {q.status === 'waiting'
                        ? uploads.started
                          ? t('photos.waiting')
                          : t('photos.queued')
                        : null}
                      {q.status === 'uploading'
                        ? t('photos.uploading', { percent: Math.round(q.progress * 100) })
                        : null}
                      {q.status === 'failed' ? (
                        <span role="alert">{q.error ?? t('photos.failed')}</span>
                      ) : null}
                      {q.status === 'uploading' ? (
                        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/30">
                          <span
                            className="block h-full bg-white"
                            style={{ width: `${Math.round(q.progress * 100)}%` }}
                          />
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {canEdit ? (
                  confirming === tile.key ? (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-xs font-semibold">{t('photos.removeConfirm')}</span>
                      <Button
                        size="sm"
                        variant="danger"
                        isDisabled={busy}
                        onPress={async () => {
                          setConfirming(null)
                          setNotice(null)
                          if (tile.saved) {
                            try {
                              await onRemove?.(tile.saved)
                            } catch (e) {
                              setNotice(e instanceof Error ? e.message : t('errors.generic'))
                            }
                          } else uploads.remove(tile.key)
                        }}
                      >
                        {t('photos.remove')}
                      </Button>
                      <Button size="sm" variant="ghost" onPress={() => setConfirming(null)}>
                        {t('common.cancel')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      {q?.status === 'failed' ? (
                        <IconButton label={t('photos.retry')} onPress={() => uploads.retry(q.id)}>
                          <RotateCcw className="size-4" aria-hidden />
                        </IconButton>
                      ) : null}
                      {!isCover && canMove(tile) ? (
                        <IconButton label={t('photos.makeCover')} onPress={() => move(tile, i, 0)}>
                          <Star className="size-4" aria-hidden />
                        </IconButton>
                      ) : null}
                      {canMove(tile) ? (
                        <>
                          <IconButton
                            label={t('photos.moveLeft')}
                            isDisabled={i === 0}
                            onPress={() => move(tile, i, i - 1)}
                          >
                            <ChevronLeft className="size-4" aria-hidden />
                          </IconButton>
                          <IconButton
                            label={t('photos.moveRight')}
                            isDisabled={i >= lastMovable}
                            onPress={() => move(tile, i, i + 1)}
                          >
                            <ChevronRight className="size-4" aria-hidden />
                          </IconButton>
                        </>
                      ) : null}
                      {q?.status !== 'uploading' ? (
                        <IconButton
                          label={t('photos.remove')}
                          isDisabled={busy && Boolean(tile.saved)}
                          onPress={() => setConfirming(tile.key)}
                        >
                          <Trash2 className="text-danger size-4" aria-hidden />
                        </IconButton>
                      ) : null}
                    </div>
                  )
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="bg-wash rounded-xl p-4 text-sm">{t('photos.empty')}</p>
      )}

      {notice ? (
        <p role="alert" className="text-danger text-sm font-medium">
          {notice}
        </p>
      ) : null}

      {canEdit ? (
        <div className="flex flex-col gap-1">
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) {
                const skipped = uploads.add(e.target.files)
                setNotice(skipped ? t('photos.skipped', { count: skipped }) : null)
              }
              e.target.value = ''
            }}
          />
          <Button
            variant="secondary"
            className="h-12 self-start"
            isDisabled={full}
            onPress={() => input.current?.click()}
          >
            <ImagePlus className="size-4" aria-hidden />
            {t('photos.add')}
          </Button>
          <p className="text-muted text-xs">
            {full
              ? t('photos.full', { max: MAX_PHOTOS })
              : t('photos.count', { count: tiles.length, max: MAX_PHOTOS })}
          </p>
        </div>
      ) : null}
    </div>
  )
}
