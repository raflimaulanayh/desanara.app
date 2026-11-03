import { Barlow_Condensed, Bitter, Nunito, Plus_Jakarta_Sans, Poppins } from 'next/font/google'

/** Platform face: Plus Jakarta Sans — friendly, designed in Indonesia, sturdy on low-end phones. */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
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

export const fontVariables = [jakarta, barlowCondensed, bitter, nunito, poppins]
  .map((f) => f.variable)
  .join(' ')
