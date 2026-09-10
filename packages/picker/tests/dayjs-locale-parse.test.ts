import dayjs from 'dayjs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import dayjsGenerateConfig from '../src/generate/dayjs'
import 'dayjs/locale/fr'

// sync rc-picker #1013: parse typed text with the picker locale (not the
// global Day.js locale) so localized month names round-trip.
describe('dayjs generateConfig locale-aware parsing', () => {
  let originalLocale: string

  beforeEach(() => {
    originalLocale = dayjs.locale()
    dayjs.locale('en')
  })

  afterEach(() => {
    dayjs.locale(originalLocale)
  })

  it.each([
    ['fr_FR', '25 août 2026', 'D MMM YYYY', '2026-08-25'],
    ['fr_FR', '25 septembre 2026', 'D MMMM YYYY', '2026-09-25'],
    ['fr_BE', '25 août 2026', 'D MMM YYYY', '2026-08-25'],
  ])('parses %s text %s without changing the global locale', (locale, text, format, expected) => {
    const date = dayjsGenerateConfig.locale.parse(locale, text, [format])

    expect(date?.format('YYYY-MM-DD')).toBe(expected)
    expect(date?.locale()).toBe('fr')
    expect(dayjs.locale()).toBe('en')
  })

  it('tries alternate formats with the requested locale', () => {
    const date = dayjsGenerateConfig.locale.parse('fr_FR', '25 août 2026', [
      'YYYY-MM-DD',
      'D MMM YYYY',
    ])

    expect(date?.format('YYYY-MM-DD')).toBe('2026-08-25')
    expect(dayjs.locale()).toBe('en')
  })

  it('parses English text when the global locale is French', () => {
    dayjs.locale('fr')
    const date = dayjsGenerateConfig.locale.parse('en_US', '25 Aug 2026', ['D MMM YYYY'])

    expect(date?.format('YYYY-MM-DD')).toBe('2026-08-25')
    expect(date?.locale()).toBe('en')
    expect(dayjs.locale()).toBe('fr')
  })

  it('keeps the global-locale fallback when locale data is not registered', () => {
    const date = dayjsGenerateConfig.locale.parse('unregistered_LOCALE', '25 Aug 2026', [
      'D MMM YYYY',
    ])

    expect(date?.format('YYYY-MM-DD')).toBe('2026-08-25')
    expect(date?.locale()).toBe('en')
    expect(dayjs.locale()).toBe('en')
  })

  it.each(['31 février 2026', '25 août 2026 extra'])(
    'keeps strict validation for localized input %s',
    (text) => {
      expect(dayjsGenerateConfig.locale.parse('fr_FR', text, ['D MMMM YYYY'])).toBeNull()
      expect(dayjs.locale()).toBe('en')
    },
  )
})
