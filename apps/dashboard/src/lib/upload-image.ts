import { unwrap } from '@repo/api-client'
import { type MediaContentType, type MediaTarget, fitWithin, mediaRules } from '@repo/validators'
import { api } from './api'

/**
 * Browser side of the upload flow (docs/architecture/storage.md): compress, ask the API for a signed
 * URL, PUT straight to R2 (with progress), then attach. Browser-only (canvas, XMLHttpRequest).
 */

export class UploadError extends Error {
  constructor(
    message: string,
    public readonly reason: 'unsupported' | 'too_large' | 'network' | 'api',
  ) {
    super(message)
    this.name = 'UploadError'
  }
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

/**
 * Always re-encodes, even small files: drawing to a canvas drops EXIF, including the GPS position
 * phones store in photos (often the owner's home; UU PDP). `createImageBitmap` applies the EXIF
 * rotation first so portrait photos stay upright. WebP when the browser can encode it, else JPEG.
 */
export async function compressImage(
  file: Blob,
  { maxEdge, maxBytes }: { maxEdge: number; maxBytes: number },
): Promise<Blob & { type: MediaContentType }> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // e.g. HEIC on Chrome/Android: the browser cannot decode it.
    throw new UploadError('Format foto tidak didukung. Pilih foto JPG atau PNG.', 'unsupported')
  }
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxEdge)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new UploadError('Browser tidak bisa memproses foto.', 'unsupported')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  for (const quality of [0.82, 0.7, 0.55]) {
    for (const type of ['image/webp', 'image/jpeg'] as const) {
      const blob = await toBlob(canvas, type, quality)
      // Browsers that cannot encode WebP silently return PNG: check the type.
      if (blob && blob.type === type && blob.size <= maxBytes) {
        return blob as Blob & { type: MediaContentType }
      }
    }
  }
  throw new UploadError('Foto terlalu besar meski sudah dikompres.', 'too_large')
}

function put(
  url: string,
  headers: Record<string, string>,
  body: Blob,
  onProgress?: (p: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total)
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new UploadError(`Upload gagal (${xhr.status}).`, 'network'))
    xhr.onerror = () => reject(new UploadError('Koneksi terputus saat upload.', 'network'))
    xhr.send(body)
  })
}

/** Compresses and uploads one image, then attaches it. Returns the entity's keys in display order. */
export async function uploadImage({
  target,
  id,
  file,
  alt,
  onProgress,
}: {
  target: MediaTarget
  id: string
  file: Blob
  alt?: string
  /** 0–1 while the bytes go to storage. */
  onProgress?: (progress: number) => void
}) {
  const rule = mediaRules[target]
  const blob = await compressImage(file, rule)
  const presigned = await unwrap(
    await api.v1.manage.media.presign.$post({
      json: { target, id, contentType: blob.type, size: blob.size },
    }),
  )
  await put(presigned.data.uploadUrl, presigned.data.headers, blob, onProgress)
  const attached = await unwrap(
    await api.v1.manage.media.$post({ json: { target, id, key: presigned.data.key, alt } }),
  )
  return attached.data.keys
}
