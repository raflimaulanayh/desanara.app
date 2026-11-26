import { expect, test } from 'bun:test'
import { villageCrest } from './village-crest'

test('uploaded village crests take priority over the matching regency emblem', () => {
  expect(
    villageCrest({ logoKey: 'seed/villages/baros/logo.webp', regionCode: '32.04' }, true),
  ).toEqual({
    url: '/media/seed/villages/baros/logo.webp',
    regency: null,
  })
  expect(villageCrest({ logoKey: null, regionCode: '32.05' })).toEqual({
    url: '/media/regency-crests/garut.webp',
    regency: 'Kabupaten Garut',
  })
  expect(villageCrest({ logoKey: null, regionCode: '32.11.01.2002' })).toEqual({
    url: '/media/regency-crests/sumedang.webp',
    regency: 'Kabupaten Sumedang',
  })
  expect(villageCrest({ logoKey: null, regionCode: '32.11-other' })).toEqual({
    url: null,
    regency: null,
  })
})
