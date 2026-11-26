export interface StoryProduct {
  slug: string
  name: string
  price: number
  compareAtPrice: number | null
  image: string | null
}

export type StoryStatus = 'preorder' | 'shop-open'

export interface CatalogueStory {
  id: string
  image?: string
  video?: string
  caption: string
  publishedAt: number
  status?: StoryStatus
  product?: StoryProduct
  catalogueSlug?: string
}

export interface StoryAccount {
  id: string
  business: string
  village: string
  stories: CatalogueStory[]
}

export function rankStoryAccounts(accounts: StoryAccount[], viewed: ReadonlySet<string>) {
  return accounts
    .flatMap((account) => {
      const stories = account.stories.toSorted((a, b) => a.publishedAt - b.publishedAt)
      const latestStory = stories.at(-1)
      if (!latestStory) return []
      const coverImage = stories.findLast(({ image }) => image)?.image
      const nextUnread = stories.findIndex(({ id }) => !viewed.has(id))
      return [
        { ...account, stories, latestStory, coverImage, nextUnread, hasUnread: nextUnread >= 0 },
      ]
    })
    .sort(
      (a, b) =>
        Number(b.hasUnread) - Number(a.hasUnread) ||
        b.latestStory.publishedAt - a.latestStory.publishedAt,
    )
}
