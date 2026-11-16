'use client'

import { Button, Card } from '@heroui/react'
import { unwrap } from '@repo/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Store, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { api } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import { type Business, businessKeys } from '@/lib/businesses'
import { mediaUrl } from '@/lib/media'
import { UploadError, uploadImage } from '@/lib/upload-image'

/**
 * Business logo: one slot. Uploading a new one replaces the old file (the API deletes it), so there
 * is no separate "replace" step. Compressed and stripped of location data like product photos.
 */
export function LogoCard({ business }: { business: Business }) {
  const t = useTranslations()
  const qc = useQueryClient()
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const src = mediaUrl(business.logoKey)
  const canEdit = business.permissions.update

  const refresh = () => qc.invalidateQueries({ queryKey: businessKeys.one(business.id) })

  async function upload(file: File) {
    setError(null)
    setProgress(0)
    try {
      await uploadImage({ target: 'business_logo', id: business.id, file, onProgress: setProgress })
      await refresh()
    } catch (e) {
      setError(e instanceof UploadError ? e.message : describeApiError(e, t).message)
    } finally {
      setProgress(null)
    }
  }

  async function remove() {
    if (!business.logoKey) return
    setError(null)
    setRemoving(true)
    try {
      await unwrap(
        await api.v1.manage.media.$delete({
          query: { target: 'business_logo', id: business.id, key: business.logoKey },
        }),
      )
      await refresh()
    } catch (e) {
      setError(describeApiError(e, t).message)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="font-bold">{t('logo.title')}</Card.Title>
        <Card.Description>{t('logo.hint')}</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-wrap items-center gap-4">
        <span className="bg-wash relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full">
          {src ? (
            <Image
              src={src}
              alt={t('logo.alt', { name: business.name })}
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <Store className="text-muted size-7" aria-hidden />
          )}
        </span>
        {canEdit ? (
          <div className="flex flex-col gap-2">
            <input
              ref={input}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void upload(file)
                e.target.value = ''
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                isPending={progress !== null}
                onPress={() => input.current?.click()}
              >
                <ImagePlus className="size-4" aria-hidden />
                {progress !== null
                  ? t('photos.uploading', { percent: Math.round(progress * 100) })
                  : src
                    ? t('logo.replace')
                    : t('logo.upload')}
              </Button>
              {src ? (
                <Button variant="ghost" isPending={removing} onPress={remove}>
                  <Trash2 className="text-danger size-4" aria-hidden />
                  {t('logo.remove')}
                </Button>
              ) : null}
            </div>
          </div>
        ) : !src ? (
          <p className="text-muted text-sm">{t('logo.none')}</p>
        ) : null}
        {error ? (
          <p role="alert" className="text-danger w-full text-sm font-medium">
            {error}
          </p>
        ) : null}
      </Card.Content>
    </Card>
  )
}
