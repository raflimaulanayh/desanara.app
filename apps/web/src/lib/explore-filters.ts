export const ALL_FILTER_OPTIONS = '_all'

export function regencyCode(regionCode: string | null) {
  return regionCode?.split('.').slice(0, 2).join('.') || undefined
}
