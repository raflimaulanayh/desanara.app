import { expect, test } from 'bun:test'
import { Coffee, Fish, Package } from 'lucide-react'
import { categoryIcon } from './category-icons'

test('category icons use the catalogue icon and fall back to the slug or package', () => {
  expect(categoryIcon('minuman', 'fish')).toBe(Fish)
  expect(categoryIcon('minuman', 'unknown')).toBe(Coffee)
  expect(categoryIcon('constructor', null)).toBe(Package)
})
