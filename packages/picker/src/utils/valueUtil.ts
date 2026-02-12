import type { GenerateConfig } from '../generate'
import type { Locale } from '../interface'

interface ValueFormatConfig<DateType> {
  generateConfig: GenerateConfig<DateType>
  locale: Locale
  valueFormat?: string
}

export function parseValue<DateType>(
  value: DateType | string | null | undefined,
  config: ValueFormatConfig<DateType>,
): DateType | null | undefined {
  const { valueFormat, generateConfig, locale } = config

  if (!valueFormat || typeof value !== 'string') {
    return value as DateType | null | undefined
  }

  const parsed = generateConfig.locale.parse(locale.locale, value, [valueFormat])

  if (parsed && generateConfig.isValidate(parsed)) {
    return parsed
  }

  return null
}

export function parseValues<DateType>(
  values: (DateType | string | null | undefined)[] | null | undefined,
  config: ValueFormatConfig<DateType>,
) {
  if (!values) {
    return values
  }

  return values.map(value => parseValue(value, config))
}

export function formatValue<DateType>(
  value: DateType | null | undefined,
  config: ValueFormatConfig<DateType>,
): DateType | string | null | undefined {
  const { valueFormat, generateConfig, locale } = config

  if (!valueFormat || value === null || value === undefined) {
    return value
  }

  return generateConfig.locale.format(locale.locale, value, valueFormat)
}

export function formatValues<DateType>(
  values: (DateType | null | undefined)[] | null | undefined,
  config: ValueFormatConfig<DateType>,
) {
  if (!values) {
    return values
  }

  return values.map(value => formatValue(value, config))
}

