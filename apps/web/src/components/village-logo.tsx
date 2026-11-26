import Image from 'next/image'

/**
 * Village crest in a round frame. The caller can label a regency emblem used as a fallback.
 */
export function VillageLogo({
  name,
  logoUrl,
  crestLabel,
  accent,
  size = 64,
}: {
  name: string
  logoUrl: string | null
  crestLabel?: string
  accent: string
  size?: number
}) {
  return (
    <span
      title={crestLabel}
      className="border-line/70 bg-surface relative z-10 grid shrink-0 place-items-center overflow-hidden rounded-full border"
      style={{ width: size, height: size }}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={crestLabel ?? ''}
          width={size}
          height={size}
          className="size-full object-contain p-1"
        />
      ) : (
        <span aria-hidden className="text-xl font-extrabold" style={{ color: accent }}>
          {name.replace(/^Desa\s+/i, '').charAt(0)}
        </span>
      )}
    </span>
  )
}
