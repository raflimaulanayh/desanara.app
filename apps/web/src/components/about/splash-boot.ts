/** sessionStorage key that remembers the about splash has played in this browser session. */
export const SPLASH_SEEN_KEY = 'desanara:about-splash'

/**
 * Runs from the root layout's <head> before the first paint of a full page load: on /tentang and
 * /en/tentang it marks `<html data-splash>` when the splash has not played in this session and the
 * visitor has not asked for reduced motion. The overlay only renders while that attribute is set, so
 * a returning visitor never sees it flash. Client-side navigation is handled by AboutSplash itself.
 * It lives in the layout because React does not run <script> tags rendered by a page component.
 */
export const splashBootScript = `try{if(/^\\/(en\\/)?tentang\\/?$/.test(location.pathname)&&!sessionStorage.getItem('${SPLASH_SEEN_KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-splash','on')}}catch(e){}`
