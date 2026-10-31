import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { base, frontendBoundaries } from './base.js'

/** ESLint flat config for Next.js apps (apps/web, apps/dashboard). */
export default [...base, ...nextVitals, ...nextTs, frontendBoundaries]
