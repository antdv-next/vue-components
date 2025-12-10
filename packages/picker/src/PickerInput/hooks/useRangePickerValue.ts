import type { GenerateConfig } from '../../generate'
import type { InternalMode } from '../../interface'

export function offsetPanelDate<DateType = any>(
  generateConfig: GenerateConfig<DateType>,
  picker: InternalMode,
  date: DateType,
  offset: number,
) {
  switch (picker) {
    case 'date':
    case 'week':
      return generateConfig.addMonth(date, offset)

    case 'month':
    case 'quarter':
      return generateConfig.addYear(date, offset)

    case 'year':
      return generateConfig.addYear(date, offset * 10)

    case 'decade':
      return generateConfig.addYear(date, offset * 100)

    default:
      return date
  }
}
