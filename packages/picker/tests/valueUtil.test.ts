import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import dayjsGenerateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'
import { formatValue, formatValues, parseValue, parseValues } from '../src/utils/valueUtil'

const config = {
  generateConfig: dayjsGenerateConfig,
  locale: enUS,
  valueFormat: 'YYYY-MM-DD',
}

describe('value format util', () => {
  it('parses string value with valueFormat', () => {
    const parsed = parseValue('2026-02-12', config)
    const text = dayjsGenerateConfig.locale.format(enUS.locale, parsed as any, 'YYYY-MM-DD')

    expect(text).toBe('2026-02-12')
  })

  it('returns null for invalid string value', () => {
    expect(parseValue('invalid-date', config)).toBeNull()
  })

  it('keeps original value when valueFormat is not configured', () => {
    const value = dayjs('2026-02-12')
    const parsed = parseValue(value, {
      ...config,
      valueFormat: undefined,
    })

    expect(parsed).toBe(value)
  })

  it('formats outgoing value to string when valueFormat is configured', () => {
    const formatted = formatValue(dayjs('2026-02-12'), config)

    expect(formatted).toBe('2026-02-12')
  })

  it('handles arrays with null safely', () => {
    const parsed = parseValues(['2026-02-12', null], config)
    const formatted = formatValues(parsed as any, config)

    expect(formatted).toEqual(['2026-02-12', null])
  })
})

