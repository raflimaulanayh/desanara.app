import { expect, test } from 'bun:test'
import { greetingName } from './greeting'

test('greets by first name, keeping an honorific with its name', () => {
  expect(greetingName('Ani Suryani')).toBe('Ani')
  expect(greetingName('Pak Hendra Gunawan')).toBe('Pak Hendra')
  expect(greetingName('bu Ani')).toBe('bu Ani')
  expect(greetingName('Pak')).toBe('Pak')
  expect(greetingName('  Rafli  ')).toBe('Rafli')
})
