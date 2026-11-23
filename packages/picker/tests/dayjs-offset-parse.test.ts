import { describe, expect, it } from 'vitest'
import dayjsGenerateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'
import { parseValue } from '../src/utils/valueUtil'

// antdv-next/antdv-next#1145
describe('dayjs generateConfig offset token parsing', () => {
  const format = 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'

  it.each([
    ['2026-10-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z'],
    ['2026-10-01T09:00:00.000+09:00', '2026-10-01T00:00:00.000Z'],
    ['2026-09-30T19:00:00.000-05:00', '2026-10-01T00:00:00.000Z'],
  ])('parses %s with an offset token', (text, iso) => {
    const date = dayjsGenerateConfig.locale.parse('en_US', text, [format])

    expect(date?.isValid()).toBe(true)
    expect(date?.toISOString()).toBe(iso)
  })

  it('parses valueFormat strings with an offset token', () => {
    const parsed = parseValue('2026-10-01T00:00:00.000Z', {
      generateConfig: dayjsGenerateConfig,
      locale: enUS,
      valueFormat: format,
    }) as any

    expect(parsed?.toISOString()).toBe('2026-10-01T00:00:00.000Z')
  })

  it('still rejects invalid text', () => {
    expect(dayjsGenerateConfig.locale.parse('en_US', 'invalid-date', [format])).toBeNull()
  })

  it('keeps strict parsing for escaped [Z] literals', () => {
    expect(dayjsGenerateConfig.locale.parse('en_US', '2026-10-01 X', ['YYYY-MM-DD [Z]'])).toBeNull()
  })
})
