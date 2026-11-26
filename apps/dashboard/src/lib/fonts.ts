import { Montserrat } from 'next/font/google'

/** Platform face, shared with apps/web (see apps/web/src/lib/fonts.ts). Variable font: one file, every weight. */
export const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})
