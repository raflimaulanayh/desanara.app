import { AwsClient } from 'aws4fetch'

/**
 * Object storage (Cloudflare R2 through its S3 API, docs/architecture/storage.md).
 * Uses aws4fetch because the API runs on the Vercel Node.js runtime (no Bun.S3Client there) and later
 * on the campus VPS; it is tiny and only needs `fetch` + Web Crypto.
 * Injected into the app so tests use `createMemoryStorage()`.
 */
export interface StoredObject {
  size: number
  contentType: string | null
}

export interface Storage {
  /**
   * Presigned PUT. Content-Type and Content-Length are part of the signature, so R2 rejects a body
   * of any other type or size: the 2 MB limit holds even if the browser skips compression.
   */
  presignPut(
    key: string,
    opts: { contentType: string; size: number; expiresIn: number },
  ): Promise<string>
  head(key: string): Promise<StoredObject | null>
  delete(key: string): Promise<void>
  /** Keys under `prefix` with their last-modified time (for the orphan clean-up script). */
  list(prefix: string): AsyncGenerator<{ key: string; lastModified: Date; size: number }>
}

export interface R2Config {
  accountId: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
}

export function createR2Storage(cfg: R2Config): Storage {
  const client = new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    service: 's3',
    region: 'auto',
  })
  const base = `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}`
  const objectUrl = (key: string) => `${base}/${key.split('/').map(encodeURIComponent).join('/')}`

  return {
    async presignPut(key, { contentType, size, expiresIn }) {
      const url = new URL(objectUrl(key))
      url.searchParams.set('X-Amz-Expires', String(expiresIn))
      const signed = await client.sign(
        new Request(url.toString(), {
          method: 'PUT',
          headers: { 'Content-Type': contentType, 'Content-Length': String(size) },
        }),
        { aws: { signQuery: true, allHeaders: true } },
      )
      return signed.url
    },

    async head(key) {
      const res = await client.fetch(objectUrl(key), { method: 'HEAD' })
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`R2 HEAD ${key} failed: ${res.status}`)
      return {
        size: Number(res.headers.get('content-length') ?? 0),
        contentType: res.headers.get('content-type'),
      }
    },

    async delete(key) {
      const res = await client.fetch(objectUrl(key), { method: 'DELETE' })
      if (!res.ok && res.status !== 404) throw new Error(`R2 DELETE ${key} failed: ${res.status}`)
    },

    async *list(prefix) {
      let token: string | undefined
      do {
        const url = new URL(base)
        url.searchParams.set('list-type', '2')
        url.searchParams.set('prefix', prefix)
        if (token) url.searchParams.set('continuation-token', token)
        const res = await client.fetch(url.toString())
        if (!res.ok) throw new Error(`R2 LIST ${prefix} failed: ${res.status}`)
        const xml = await res.text()
        for (const [, body] of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
          const tag = (name: string) => body!.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1]
          yield {
            key: decodeXml(tag('Key') ?? ''),
            lastModified: new Date(tag('LastModified') ?? 0),
            size: Number(tag('Size') ?? 0),
          }
        }
        token = xml.includes('<IsTruncated>true</IsTruncated>')
          ? decodeXml(xml.match(/<NextContinuationToken>([^<]*)</)?.[1] ?? '')
          : undefined
      } while (token)
    },
  }
}

const decodeXml = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')

/** In-memory storage for tests: `put()` simulates the browser upload. */
export function createMemoryStorage() {
  const objects = new Map<string, StoredObject & { lastModified: Date }>()
  const storage: Storage & {
    put(key: string, size: number, contentType: string): void
    has(key: string): boolean
  } = {
    async presignPut(key, { contentType, size, expiresIn }) {
      return `https://storage.test/${key}?type=${encodeURIComponent(contentType)}&size=${size}&expires=${expiresIn}`
    },
    async head(key) {
      const o = objects.get(key)
      return o ? { size: o.size, contentType: o.contentType } : null
    },
    async delete(key) {
      objects.delete(key)
    },
    async *list(prefix) {
      for (const [key, o] of objects) {
        if (key.startsWith(prefix)) yield { key, lastModified: o.lastModified, size: o.size }
      }
    },
    put(key, size, contentType) {
      objects.set(key, { size, contentType, lastModified: new Date() })
    },
    has: (key) => objects.has(key),
  }
  return storage
}
