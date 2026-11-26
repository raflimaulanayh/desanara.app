import { expect, test } from 'bun:test'
import { rankStoryAccounts } from './story-order'

test('ranks unread businesses first by newest update and plays each business chronologically', () => {
  const account = (id: string, times: number[]) => ({
    id,
    business: id,
    village: 'Desa Baros',
    stories: times.map((publishedAt) => ({
      id: `${id}-${publishedAt}`,
      image: '',
      caption: '',
      publishedAt,
    })),
  })
  const accounts = [
    account('older', [2]),
    account('read', [10]),
    account('partial', [8, 3, 5]),
    account('also-read', [1]),
    account('empty', []),
  ]
  const ranked = rankStoryAccounts(accounts, new Set(['read-10', 'partial-3', 'also-read-1']))

  expect(ranked.map(({ id }) => id)).toEqual(['partial', 'older', 'read', 'also-read'])
  expect(ranked[0]?.stories.map(({ publishedAt }) => publishedAt)).toEqual([3, 5, 8])
  expect(ranked[0]?.nextUnread).toBe(1)
  expect(ranked[0]?.latestStory.id).toBe('partial-8')
  expect(accounts[2]?.stories[0]?.id).toBe('partial-8')
})
