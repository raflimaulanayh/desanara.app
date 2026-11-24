import Image from 'next/image'

/**
 * Village crest in a white round frame. Official logos are shown untouched; with no logo we print
 * the village's initial in its colour.
 */
export function VillageLogo({
  name,
  logoUrl,
  accent,
  size = 64,
}: {
  name: string
  logoUrl: string | null
  accent: string
  size?: number
}) {
  return (
    <span
      className="relative z-10 grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-white shadow-md"
      style={{ width: size, height: size }}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
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
