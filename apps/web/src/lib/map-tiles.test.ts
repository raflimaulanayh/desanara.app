import { mapTileConfig } from '@repo/ui/map-tiles'
import { expect, test } from 'bun:test'

test('uses custom raster tiles with matching provider credit', () => {
  const url = 'https://maps.example.org/desanara/{z}/{x}/{y}.png'
  const attribution = '© Basemap provider'

  expect(mapTileConfig(url, attribution)).toEqual({ url, attribution })
  expect(mapTileConfig(url, ' ')).toEqual(mapTileConfig())
})

test('links the compact OpenStreetMap credit to its license', () => {
  expect(mapTileConfig().attribution).toBe(
    '<a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a>',
  )
})
