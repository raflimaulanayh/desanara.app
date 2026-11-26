import empty from '../assets/mascot/nara-empty.webp'
import notFound from '../assets/mascot/nara-not-found.webp'
import unavailable from '../assets/mascot/nara-unavailable.webp'

const poses = { empty, 'not-found': notFound, unavailable }
export type MascotPose = keyof typeof poses

/** All status information is in the adjacent text. */
export function StatusMascot({ pose, fullPage = false }: { pose: MascotPose; fullPage?: boolean }) {
  const size = fullPage ? 192 : 96
  return (
    <img
      src={poses[pose].src}
      alt=""
      width={size}
      height={size}
      decoding="async"
      className={fullPage ? 'size-40 object-contain sm:size-48' : 'size-24 object-contain'}
    />
  )
}
