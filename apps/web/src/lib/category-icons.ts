import {
  Coffee,
  Fish,
  Package,
  Scissors,
  Shirt,
  Sprout,
  Utensils,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'
import { createElement } from 'react'

const ICONS = new Map<string, LucideIcon>([
  ['utensils', Utensils],
  ['cup', Coffee],
  ['scissors', Scissors],
  ['shirt', Shirt],
  ['sprout', Sprout],
  ['fish', Fish],
])

// Product summaries carry the category slug without the icon field.
const ICON_BY_SLUG = new Map([
  ['makanan-camilan', 'utensils'],
  ['minuman', 'cup'],
  ['kerajinan', 'scissors'],
  ['fesyen', 'shirt'],
  ['hasil-tani', 'sprout'],
  ['peternakan-perikanan', 'fish'],
])

export function categoryIcon(slug: string | null | undefined, icon?: string | null): LucideIcon {
  return ICONS.get(icon ?? '') ?? ICONS.get(ICON_BY_SLUG.get(slug ?? '') ?? '') ?? Package
}

/** Renders the icon for a category slug (a stable component, so lookups never create one during render). */
export function CategoryIcon({
  slug,
  ...props
}: LucideProps & { slug: string | null | undefined }) {
  return createElement(categoryIcon(slug), props)
}
