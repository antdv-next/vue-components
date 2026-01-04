import type { ComputedRef, Ref } from 'vue'
import type { FormatType, InternalMode, Locale, SharedPickerProps } from '../../interface'
import { computed } from 'vue'
import { getRowFormat, toArray } from '../../utils/miscUtil'

export function useFieldFormat<DateType = any>(
  picker: Ref<InternalMode>,
  locale: Ref<Locale>,
  format?: Ref<SharedPickerProps['format'] | undefined>,
): [formatList: ComputedRef<FormatType<DateType>[]>, maskFormat: ComputedRef<string | undefined>] {
  const info = computed(() => {
    const rawFormat = getRowFormat(picker.value, locale.value, format?.value)

    const formatList = toArray(rawFormat)

    const firstFormat = formatList[0]
    const maskFormat
      = typeof firstFormat === 'object' && firstFormat.type === 'mask' ? firstFormat.format : undefined

    return {
      formatList: formatList.map(config =>
        typeof config === 'string' || typeof config === 'function' ? config : config!.format,
      ),
      maskFormat,
    }
  })

  return [
    computed(() => info.value.formatList),
    computed(() => info.value.maskFormat),
  ] as const
}
