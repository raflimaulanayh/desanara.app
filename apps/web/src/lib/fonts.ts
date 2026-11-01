import { Barlow, Barlow_Condensed, Bitter, Nunito, Poppins } from 'next/font/google'

/** Platform faces: Barlow for reading, Barlow Condensed for everything "printed" on the nota. */
export const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})
export const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

/** Curated village display faces (villageFonts in @repo/validators). Not preloaded: only village pages use them. */
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

export const fontVariables = [barlow, barlowCondensed, bitter, nunito, poppins]
  .map((f) => f.variable)
  .join(' ')
