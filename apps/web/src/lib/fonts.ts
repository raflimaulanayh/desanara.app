import { Barlow_Condensed, Bitter, Montserrat, Nunito, Poppins } from 'next/font/google'

/**
 * Platform face: Montserrat, the same family as the logo wordmark. Variable font, so one file covers every
 * weight. The dashboard loads it the same way (apps/dashboard/src/lib/fonts.ts).
 */
export const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

/** Curated village display faces (villageFonts in @repo/validators). Not preloaded: only village pages use them. */
export const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
  preload: false,
})
export const bitter = Bitter({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-bitter',
  display: 'swap',
  preload: false,
})
export const nunito = Nunito({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-nunito',
  display: 'swap',
  preload: false,
})
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: false,
})

export const fontVariables = [montserrat, barlowCondensed, bitter, nunito, poppins]
  .map((f) => f.variable)
  .join(' ')
