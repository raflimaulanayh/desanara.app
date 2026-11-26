const openStreetMap = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '<a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a>',
}

/** A custom basemap includes the credit required by its provider. */
export function mapTileConfig(url?: string, attribution?: string) {
  const tileUrl = url?.trim()
  const tileAttribution = attribution?.trim()
  return tileUrl && tileAttribution ? { url: tileUrl, attribution: tileAttribution } : openStreetMap
}
